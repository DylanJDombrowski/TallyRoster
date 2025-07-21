// app/dashboard/players/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const PlayerStatusSchema = z.object({
  playerId: z.string().uuid(),
  status: z.enum(["active", "archived"]),
});

export async function updatePlayerStatus(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);

  const validatedFields = PlayerStatusSchema.safeParse({
    playerId: formData.get("playerId"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid data provided." };
  }

  const { playerId, status } = validatedFields.data;

  const { error } = await supabase.from("players").update({ status }).eq("id", playerId);

  if (error) {
    return { error: `Failed to update player status: ${error.message}` };
  }

  revalidatePath("/dashboard/players");

  const statusText = status === "archived" ? "archived" : "activated";
  return { success: `Player ${statusText} successfully.` };
}

export async function deletePlayer(playerId: string) {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);

  const { error } = await supabase.from("players").delete().eq("id", playerId);

  if (error) {
    return { error: `Failed to delete player: ${error.message}` };
  }

  revalidatePath("/dashboard/players");
  return { success: "Player deleted permanently." };
}

// New action for bulk operations (useful for the enhanced CSV functionality)
export async function bulkUpdatePlayers(players: Array<{ id: string; [key: string]: unknown }>) {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);

  try {
    const updatePromises = players.map((player) => supabase.from("players").update(player).eq("id", player.id));

    const results = await Promise.all(updatePromises);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      return { error: `Failed to update ${errors.length} players` };
    }

    revalidatePath("/dashboard/players");
    return { success: `Successfully updated ${players.length} players.` };
  } catch {
    return { error: "Bulk update failed." };
  }
}

// Enhanced CSV export functionality
export async function exportPlayersCSV(organizationId: string, teamId?: string) {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);

  let query = supabase
    .from("players")
    .select(
      `
      first_name,
      last_name,
      jersey_number,
      position,
      grad_year,
      height,
      town,
      school,
      gpa,
      bats,
      throws,
      twitter_handle,
      teams!inner(name)
    `
    )
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: `Failed to export players: ${error.message}` };
  }

  // Convert to CSV format
  const headers = [
    "first_name",
    "last_name",
    "jersey_number",
    "position",
    "grad_year",
    "height",
    "town",
    "school",
    "gpa",
    "bats",
    "throws",
    "twitter_handle",
    "team_name",
  ];

  const csvRows = [
    headers.join(","),
    ...data.map((player) =>
      [
        player.first_name,
        player.last_name,
        player.jersey_number || "",
        player.position || "",
        player.grad_year || "",
        player.height || "",
        player.town || "",
        player.school || "",
        player.gpa || "",
        player.bats || "",
        player.throws || "",
        player.twitter_handle || "",
        player.teams?.name || "",
      ]
        .map((field) => `"${field}"`)
        .join(",")
    ),
  ];

  return {
    success: "Export completed successfully",
    csvData: csvRows.join("\n"),
    filename: `players_export_${new Date().toISOString().split("T")[0]}.csv`,
  };
}
