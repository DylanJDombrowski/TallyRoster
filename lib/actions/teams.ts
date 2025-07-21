// lib/actions/teams.ts - Centralized team actions with improved error handling
"use server";

import { getServerClient, getCurrentUserOrganization } from "@/lib/services/database";
import { validateFormData, type ActionResult } from "@/lib/services/validation";
import { withErrorHandling, handleDatabaseError, handleAuthError } from "@/lib/services/error-handling";
import { TeamFormSchema } from "@/lib/schemas/team";

/**
 * Upsert team (create or update)
 */
export const upsertTeam = withErrorHandling(
  async (formData: FormData): Promise<ActionResult<{ team: any; isNew: boolean }>> => {
    // Validate form data
    const validation = validateFormData(TeamFormSchema, formData);
    if (!validation.success) return validation;

    const { id, name, season, primary_color, secondary_color, year, team_image_url } = validation.data;

    try {
      // Get user's organization context
      const userContext = await getCurrentUserOrganization();
      if (!userContext) {
        return handleAuthError(new Error("Not authenticated"));
      }

      if (userContext.role !== "admin") {
        return { success: false, error: "Not authorized to manage teams" };
      }

      const supabase = await getServerClient();

      // Check for duplicate team name in same season
      if (name && season) {
        const { data: existingTeam } = await supabase
          .from("teams")
          .select("id, name, season")
          .eq("organization_id", userContext.organization.id)
          .ilike("name", name) // Case-insensitive check
          .eq("season", season)
          .neq("id", id || "00000000-0000-0000-0000-000000000000") // Exclude current team when editing
          .maybeSingle();

        if (existingTeam) {
          return {
            success: false,
            error: `A team named "${name}" already exists for the ${season} season`,
            details: {
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
        organization_id: userContext.organization.id,
      };

      let result;
      const isNew = !id;

      if (id) {
        // Update existing team
        const { data, error } = await supabase
          .from("teams")
          .update(teamData)
          .eq("id", id)
          .eq("organization_id", userContext.organization.id) // Security check
          .select()
          .single();

        if (error) return handleDatabaseError(error);
        result = data;
      } else {
        // Create new team
        const { data, error } = await supabase
          .from("teams")
          .insert(teamData)
          .select()
          .single();

        if (error) return handleDatabaseError(error);
        result = data;
      }

      return {
        success: true,
        data: {
          team: result,
          isNew
        }
      };
    } catch (error) {
      return handleDatabaseError(error);
    }
  },
  {
    revalidatePaths: ["/dashboard/admin/teams"],
    successMessage: "Team saved successfully."
  }
);

/**
 * Delete a team
 */
export const deleteTeam = withErrorHandling(
  async (teamId: string): Promise<ActionResult<{ message: string }>> => {
    if (!teamId) {
      return { success: false, error: "Team ID is required" };
    }

    try {
      const userContext = await getCurrentUserOrganization();
      if (!userContext) {
        return handleAuthError(new Error("Not authenticated"));
      }

      if (userContext.role !== "admin") {
        return { success: false, error: "Not authorized to delete teams" };
      }

      const supabase = await getServerClient();

      // Check if team has players
      const { data: players } = await supabase
        .from("players")
        .select("id")
        .eq("team_id", teamId)
        .limit(1);

      if (players && players.length > 0) {
        return {
          success: false,
          error: "Cannot delete team with existing players. Please remove all players first."
        };
      }

      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId)
        .eq("organization_id", userContext.organization.id); // Security check

      if (error) {
        return handleDatabaseError(error);
      }

      return {
        success: true,
        data: { message: "Team deleted successfully." }
      };
    } catch (error) {
      return handleDatabaseError(error);
    }
  },
  {
    revalidatePaths: ["/dashboard/admin/teams"]
  }
);