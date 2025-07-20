// app/dashboard/admin/teams/actions.ts - UPDATED with duplicate checking

"use server";

import { createClient } from "@/lib/supabase/server";
import { TeamFormSchema } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function upsertTeam(prevState: unknown, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);

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
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data. Please check your inputs.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, season, primary_color, secondary_color, year, team_image_url } = validatedFields.data;

  // 🔧 FIX: Server-side duplicate check
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
          name: [`A team named "${name}" already exists for the ${season} season`],
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

  let data, error;

  try {
    if (id) {
      // Update existing team
      ({ data, error } = await supabase
        .from("teams")
        .update(teamData)
        .eq("id", id)
        .eq("organization_id", userOrgRole.organization_id) // Security check
        .select()
        .single());
    } else {
      // Create new team
      ({ data, error } = await supabase.from("teams").insert(teamData).select().single());
    }

    if (error) {
      return { error: `Database error: ${error.message}` };
    }

    if (!data) {
      return { error: "Failed to save team. The data was not returned after saving, which may be due to a permissions issue." };
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }

  revalidatePath("/dashboard/admin/teams");
  return { success: `Team "${data.name}" saved successfully.`, team: data };
}

export async function deleteTeam(teamId: string) {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);

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

  // Only allow deleting teams from user's organization
  const { error } = await supabase.from("teams").delete().eq("id", teamId).eq("organization_id", userOrgRole.organization_id);

  if (error) {
    return { error: `Failed to delete team: ${error.message}` };
  }

  revalidatePath("/dashboard/admin/teams");
  return { success: "Team deleted successfully." };
}
