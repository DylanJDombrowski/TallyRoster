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
  const cookieStore = cookies(); // NEW WAY
  const supabase = createClient(await cookieStore); // NEW WAY
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
  return { success: `Player status updated to ${status}.` };
}

export async function deletePlayer(playerId: string) {
  const cookieStore = cookies(); // NEW WAY
  const supabase = createClient(await cookieStore); // NEW WAY
  const { error } = await supabase.from("players").delete().eq("id", playerId);

  if (error) {
    return { error: `Failed to delete player: ${error.message}` };
  }

  revalidatePath("/dashboard/players");
  return { success: "Player deleted permanently." };
}
