// app/dashboard/admin/teams/actions.ts
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
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data. Please check your inputs.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, season } = validatedFields.data;

  // FIXED: Include organization_id when creating/updating teams
  const teamData = {
    name,
    season,
    organization_id: userOrgRole.organization_id,
  };

  let data, error;

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
    return { error: `Failed to save team: ${error.message}` };
  }

  revalidatePath("/dashboard/admin/teams");
  if (!data) {
    return { error: "Failed to save team: No data returned." };
  }
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

  // FIXED: Only allow deleting teams from user's organization
  const { error } = await supabase.from("teams").delete().eq("id", teamId).eq("organization_id", userOrgRole.organization_id);

  if (error) {
    return { error: `Failed to delete team: ${error.message}` };
  }

  revalidatePath("/dashboard/admin/teams");
  return { success: "Team deleted successfully." };
}
