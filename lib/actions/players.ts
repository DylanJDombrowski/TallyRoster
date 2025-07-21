// lib/actions/players.ts - Centralized player actions with improved error handling
"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/services/database";
import { validateFormData, type ActionResult } from "@/lib/services/validation";
import { withErrorHandling, handleDatabaseError } from "@/lib/services/error-handling";
import { PlayerStatusSchema } from "@/lib/schemas/player";

/**
 * Update player status (active/archived)
 */
export const updatePlayerStatus = withErrorHandling(
  async (formData: FormData): Promise<ActionResult<{ message: string }>> => {
    const validation = validateFormData(PlayerStatusSchema, formData);
    if (!validation.success) return validation;

    const { playerId, status } = validation.data;

    try {
      const supabase = await getServerClient();
      const { error } = await supabase
        .from("players")
        .update({ status })
        .eq("id", playerId);

      if (error) {
        return handleDatabaseError(error);
      }

      const statusText = status === "archived" ? "archived" : "activated";
      return {
        success: true,
        data: { message: `Player ${statusText} successfully.` }
      };
    } catch (error) {
      return handleDatabaseError(error);
    }
  },
  {
    revalidatePaths: ["/dashboard/players"]
  }
);

/**
 * Delete a player
 */
export const deletePlayer = withErrorHandling(
  async (playerId: string): Promise<ActionResult<{ message: string }>> => {
    if (!playerId) {
      return { success: false, error: "Player ID is required" };
    }

    try {
      const supabase = await getServerClient();
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", playerId);

      if (error) {
        return handleDatabaseError(error);
      }

      return {
        success: true,
        data: { message: "Player deleted successfully." }
      };
    } catch (error) {
      return handleDatabaseError(error);
    }
  },
  {
    revalidatePaths: ["/dashboard/players"]
  }
);