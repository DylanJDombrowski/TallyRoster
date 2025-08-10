// lib/actions/teams.ts - UPDATED with coach management

"use server";

import { createClient } from "@/lib/supabase/server";
import { TeamFormSchema } from "@/lib/schemas/team";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function upsertTeam(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get user's organization
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: userOrgRole } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!userOrgRole || userOrgRole.role !== "admin") {
    return { error: "Not authorized to manage teams" };
  }

  const validatedFields = TeamFormSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    season: formData.get("season"),
    primary_color: formData.get("primary_color"),
    secondary_color: formData.get("secondary_color"),
    year: formData.get("year"),
    team_image_url: formData.get("team_image_url") || null,
    // NEW: Coach fields
    coach_name: formData.get("coach_name") || undefined,
    coach_email: formData.get("coach_email") || undefined,
    coach_phone: formData.get("coach_phone") || undefined,
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data. Please check your inputs.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    id,
    name,
    season,
    primary_color,
    secondary_color,
    year,
    team_image_url,
    coach_name,
    coach_email,
    coach_phone,
  } = validatedFields.data;

  // Server-side duplicate check
  if (name && season) {
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id, name, season")
      .eq("organization_id", userOrgRole.organization_id)
      .ilike("name", name) // Case-insensitive check
      .eq("season", season)
      .neq("id", id || "00000000-0000-0000-0000-000000000000") // Exclude current team when editing
      .single();

    if (existingTeam) {
      return {
        error: `A team named "${name}" already exists for the ${season} season`,
        fields: {
          name: [
            `A team named "${name}" already exists for the ${season} season`,
          ],
        },
      };
    }
  }

  const teamData = {
    name,
    season,
    primary_color,
    secondary_color,
    year,
    team_image_url,
    organization_id: userOrgRole.organization_id,
  };

  let teamResult, error;

  try {
    if (id) {
      // Update existing team
      ({ data: teamResult, error } = await supabase
        .from("teams")
        .update(teamData)
        .eq("id", id)
        .eq("organization_id", userOrgRole.organization_id) // Security check
        .select()
        .single());
    } else {
      // Create new team
      ({ data: teamResult, error } = await supabase
        .from("teams")
        .insert(teamData)
        .select()
        .single());
    }

    if (error) {
      return { error: `Database error: ${error.message}` };
    }

    if (!teamResult) {
      return {
        error:
          "Failed to save team. The data was not returned after saving, which may be due to a permissions issue.",
      };
    }

    // NEW: Handle coach creation/update
    if (coach_name && coach_name.trim()) {
      console.log(
        `[Team Actions] Managing coach for team ${teamResult.id}: ${coach_name}`
      );

      // Check if team already has a coach
      const { data: existingCoach } = await supabase
        .from("coaches")
        .select("id, name, email, phone")
        .eq("team_id", teamResult.id)
        .single();

      const coachData = {
        team_id: teamResult.id,
        name: coach_name.trim(),
        email: coach_email?.trim() || null,
        phone: coach_phone?.trim() || null,
        position: "Head Coach", // Default position
        order_index: 0, // Primary coach
      };

      if (existingCoach) {
        // Update existing coach
        console.log(
          `[Team Actions] Updating existing coach ${existingCoach.id}`
        );
        const { error: coachError } = await supabase
          .from("coaches")
          .update(coachData)
          .eq("id", existingCoach.id);

        if (coachError) {
          console.error(`[Team Actions] Error updating coach:`, coachError);
          // Don't fail the entire operation if coach update fails
          return {
            success: `Team "${teamResult.name}" saved successfully, but there was an issue updating the coach information.`,
            team: teamResult,
          };
        }

        console.log(
          `[Team Actions] ✅ Successfully updated coach for team ${teamResult.name}`
        );
      } else {
        // Create new coach
        console.log(
          `[Team Actions] Creating new coach for team ${teamResult.id}`
        );
        const { error: coachError } = await supabase
          .from("coaches")
          .insert(coachData);

        if (coachError) {
          console.error(`[Team Actions] Error creating coach:`, coachError);
          // Don't fail the entire operation if coach creation fails
          return {
            success: `Team "${teamResult.name}" saved successfully, but there was an issue creating the coach record.`,
            team: teamResult,
          };
        }

        console.log(
          `[Team Actions] ✅ Successfully created coach for team ${teamResult.name}`
        );
      }
    } else {
      console.log(
        `[Team Actions] No coach name provided for team ${teamResult.id}`
      );
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`[Team Actions] Unexpected error:`, e);
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }

  revalidatePath("/dashboard/admin/teams");
  revalidatePath("/dashboard/communications"); // Refresh communications to pick up new coaches
  return {
    success: `Team "${teamResult.name}" saved successfully.`,
    team: teamResult,
  };
}

export async function deleteTeam(teamId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get user's organization for security
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: userOrgRole } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!userOrgRole || userOrgRole.role !== "admin") {
    return { error: "Not authorized to delete teams" };
  }

  // Check if team has players assigned
  const { data: playersOnTeam } = await supabase
    .from("players")
    .select("id")
    .eq("team_id", teamId)
    .eq("status", "active")
    .limit(1);

  if (playersOnTeam && playersOnTeam.length > 0) {
    return {
      error:
        "Cannot delete team with active players. Please move or remove players first.",
    };
  }

  try {
    // Delete associated coaches first (due to foreign key constraint)
    console.log(`[Team Actions] Deleting coaches for team ${teamId}`);
    const { error: coachDeleteError } = await supabase
      .from("coaches")
      .delete()
      .eq("team_id", teamId);

    if (coachDeleteError) {
      console.error(`[Team Actions] Error deleting coaches:`, coachDeleteError);
      return {
        error: `Failed to delete team coaches: ${coachDeleteError.message}`,
      };
    }

    // Now delete the team
    console.log(`[Team Actions] Deleting team ${teamId}`);
    const { error: teamDeleteError } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId)
      .eq("organization_id", userOrgRole.organization_id);

    if (teamDeleteError) {
      console.error(`[Team Actions] Error deleting team:`, teamDeleteError);
      return { error: `Failed to delete team: ${teamDeleteError.message}` };
    }

    console.log(
      `[Team Actions] ✅ Successfully deleted team ${teamId} and associated coaches`
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`[Team Actions] Unexpected error during deletion:`, e);
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }

  revalidatePath("/dashboard/admin/teams");
  revalidatePath("/dashboard/communications"); // Refresh communications to remove deleted coaches
  return { success: "Team and associated coaches deleted successfully." };
}

// NEW: Function to get team with coach information for editing
export async function getTeamWithCoach(teamId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: userOrgRole } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!userOrgRole || userOrgRole.role !== "admin") {
    return { error: "Not authorized to view teams" };
  }

  // Get team with coach information
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(
      `
      *,
      coaches(
        id,
        name,
        email,
        phone,
        position
      )
    `
    )
    .eq("id", teamId)
    .eq("organization_id", userOrgRole.organization_id)
    .single();

  if (teamError) {
    return { error: `Failed to fetch team: ${teamError.message}` };
  }

  return { team };
}
