// app/dashboard/admin/teams/actions.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { TeamFormSchema } from "@/lib/types"; // Make sure this schema is also updated
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

  // ADDED: Include color fields in the Zod validation
  const validatedFields = TeamFormSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    season: formData.get("season"),
    primary_color: formData.get("primary_color"), // ADDED
    secondary_color: formData.get("secondary_color"), // ADDED
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data. Please check your inputs.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  // ADDED: Destructure the color fields
  const { id, name, season, primary_color, secondary_color } = validatedFields.data;

  // FIXED: Include all fields, including organization_id, when creating/updating teams
  const teamData = {
    name,
    season,
    primary_color, // ADDED
    secondary_color, // ADDED
    organization_id: userOrgRole.organization_id,
  };

  let data, error;

  try {
    // ADDED: Wrap database call in a try/catch for better error handling
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
      // This will now catch database-level errors
      return { error: `Database error: ${error.message}` };
    }

    if (!data) {
      // This specifically catches the silent RLS failure
      return { error: "Failed to save team. The data was not returned after saving, which may be due to a permissions issue." };
    }
  } catch (e: unknown) {
    // This will catch any other unexpected errors
    const errorMessage = e instanceof Error ? e.message : String(e);
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }

  revalidatePath("/dashboard/admin/teams");
  return { success: `Team "${data.name}" saved successfully.`, team: data };
}
