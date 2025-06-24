// app/dashboard/admin/users/actions.ts
"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const InviteUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["admin", "coach", "parent"]),
  team_id: z.string().uuid({ message: "Please select a valid team" }).optional().nullable(),
});

// Corrected function signature
export async function inviteUser(prevState: unknown, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerActionClient(
    { cookies: () => cookieStore },
    {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  );

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
