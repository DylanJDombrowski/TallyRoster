// app/dashboard/admin/users/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const InviteUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["admin", "coach", "parent"]),
  team_id: z.string().uuid({ message: "Please select a valid team" }).optional().nullable(),
});

export async function inviteUser(prevState: unknown, formData: FormData) {
  const cookieStore = cookies(); // NEW WAY
  const supabase = createClient(await cookieStore); // NEW WAY

  const validatedFields = InviteUserSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    team_id: formData.get("team_id") || null,
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data. Please check your inputs.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, role, team_id } = validatedFields.data;

  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    return { error: `Failed to invite user: ${inviteError.message}` };
  }

  if (!inviteData.user) {
    return { error: "User was not created, cannot assign role." };
  }

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: inviteData.user.id,
    role: role,
    team_id: team_id,
  });

  if (roleError) {
    return {
      error: `User invited, but failed to assign role: ${roleError.message}`,
    };
  }

  revalidatePath("/dashboard/admin/users");
  return { success: `Invitation sent successfully to ${email}` };
}

// NEW: Schema for updating a user's role
const UpdateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "coach", "parent"]),
  team_id: z.string().uuid().optional().nullable(),
});

// NEW: Server action to update a user's role
export async function updateUserRole(prevState: unknown, formData: FormData) {
  const cookieStore = cookies(); // NEW WAY
  const supabase = createClient(await cookieStore); // NEW WAY
  const validatedFields = UpdateUserRoleSchema.safeParse({
    user_id: formData.get("user_id"),
    role: formData.get("role"),
    team_id: formData.get("team_id") || null,
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data.",
    };
  }

  const { user_id, role, team_id } = validatedFields.data;

  // An admin role should not be tied to a specific team
  const final_team_id = role === "admin" ? null : team_id;

  // Find the existing user_roles entry
  const { data: existingRole, error: findError } = await supabase.from("user_roles").select("id").eq("user_id", user_id).single();

  if (findError || !existingRole) {
    return { error: `Could not find a role for the specified user.` };
  }

  // Update the existing role
  const { error: updateError } = await supabase.from("user_roles").update({ role, team_id: final_team_id }).eq("id", existingRole.id);

  if (updateError) {
    return { error: `Failed to update user role: ${updateError.message}` };
  }

  revalidatePath("/dashboard/admin/users");
  return { success: "User role updated successfully." };
}
