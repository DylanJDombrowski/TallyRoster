// app/dashboard/admin/users/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

// Type for user with role information
type UserWithRole = User & {
  role: string;
  team_id: string | null;
  team_name: string | null;
};

// Type for teams
type Team = {
  created_at: string;
  id: string;
  name: string;
  organization_id: string | null;
  primary_color: string | null;
  season: string | null;
  secondary_color: string | null;
  team_image_url: string | null;
  year: number | null;
};

// Return type for getOrganizationUsers
type GetUsersResult =
  | {
      users: UserWithRole[];
      teams: Team[];
    }
  | {
      error: string;
    };

// Get organization users function
export async function getOrganizationUsers(): Promise<GetUsersResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log("🔍 Getting organization users...");

  // Check if current user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("❌ Auth error:", authError);
    return { error: "Authentication required" };
  }
  console.log("✅ User authenticated:", user.email);

  // Get user's admin role and organization
  const { data: userOrgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("role, organization_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (roleError || !userOrgRole) {
    console.error("❌ User is not an admin:", roleError);
    return { error: "Admin access required" };
  }
  console.log("✅ User is admin for org:", userOrgRole.organization_id);

  // Get all users in the organization
  const { data: orgUsers, error: orgUsersError } = await supabase
    .from("user_organization_roles")
    .select("user_id, role")
    .eq("organization_id", userOrgRole.organization_id);

  if (orgUsersError) {
    console.error("❌ Error loading organization users:", orgUsersError);
    return { error: `Error loading organization users: ${orgUsersError.message}` };
  }
  console.log("✅ Found organization users:", orgUsers?.length || 0);

  // Get auth user details using admin client
  const userIds = orgUsers?.map((u) => u.user_id) || [];
  console.log("🔍 Fetching auth user details for:", userIds.length, "users");

  const { data: authData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();

  if (authUsersError) {
    console.error("❌ Error loading user details:", authUsersError);
    return { error: `Error loading user details: ${authUsersError.message}` };
  }

  // Filter to only users in this organization
  const orgAuthUsers = authData.users.filter((authUser) => userIds.includes(authUser.id));
  console.log("✅ Found auth users:", orgAuthUsers.length);

  // Get user roles and teams (from your secondary user_roles table)
  const { data: userRoles, error: userRolesError } = await supabase.from("user_roles").select("*, teams(name)").in("user_id", userIds);

  if (userRolesError) {
    console.error("❌ Error loading user roles:", userRolesError);
    return { error: `Error loading user roles: ${userRolesError.message}` };
  }
  console.log("✅ Found user roles:", userRoles?.length || 0);

  // Get teams for forms
  const { data: teams, error: teamsError } = await supabase.from("teams").select("*").eq("organization_id", userOrgRole.organization_id);

  if (teamsError) {
    console.error("❌ Error loading teams:", teamsError);
    return { error: `Error loading teams: ${teamsError.message}` };
  }
  console.log("✅ Found teams:", teams?.length || 0);

  // Combine the data
  const combinedUsers: UserWithRole[] = orgAuthUsers.map((authUser) => {
    const orgRole = orgUsers?.find((ou) => ou.user_id === authUser.id);
    const roleInfo = userRoles?.find((r) => r.user_id === authUser.id);

    return {
      ...authUser,
      role: roleInfo?.role || orgRole?.role || "Not Set",
      team_id: roleInfo?.team_id || null,
      team_name: roleInfo?.teams?.name || "N/A",
    };
  });

  console.log("✅ Combined users ready:", combinedUsers.length);

  return {
    users: combinedUsers,
    teams: teams || [],
  };
}

// Rest of the existing functions remain the same...
const InviteUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["admin", "coach", "parent"]),
  team_id: z.string().uuid({ message: "Please select a valid team" }).optional().nullable(),
});

export async function inviteUser(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if current user is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  const { data: userOrgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("role, organization_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (roleError || !userOrgRole) {
    return { error: "Admin access required" };
  }

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

  // Use admin client to invite user
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    return { error: `Failed to invite user: ${inviteError.message}` };
  }

  if (!inviteData.user) {
    return { error: "User was not created, cannot assign role." };
  }

  // Add to user_organization_roles table
  const { error: orgRoleError } = await supabase.from("user_organization_roles").insert({
    user_id: inviteData.user.id,
    organization_id: userOrgRole.organization_id,
    role: role === "parent" ? "member" : role, // Map parent to member in org roles
  });

  if (orgRoleError) {
    console.error("Failed to assign organization role:", orgRoleError);
    return { error: `User invited, but failed to assign organization role: ${orgRoleError.message}` };
  }

  // Add to user_roles table (for team assignments and detailed roles)
  const { error: userRoleError } = await supabase.from("user_roles").insert({
    user_id: inviteData.user.id,
    role: role,
    team_id: team_id,
  });

  if (userRoleError) {
    console.error("Failed to assign user role:", userRoleError);
    return { error: `User invited, but failed to assign user role: ${userRoleError.message}` };
  }

  revalidatePath("/dashboard/admin/users");
  return { success: `Invitation sent successfully to ${email}` };
}

// Updated user role update function
const UpdateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "coach", "parent"]),
  team_id: z.string().uuid().optional().nullable(),
});

export async function updateUserRole(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if current user is admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  const { data: userOrgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("role, organization_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (roleError || !userOrgRole) {
    return { error: "Admin access required" };
  }

  const validatedFields = UpdateUserRoleSchema.safeParse({
    user_id: formData.get("user_id"),
    role: formData.get("role"),
    team_id: formData.get("team_id") || null,
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data." };
  }

  const { user_id, role, team_id } = validatedFields.data;

  // Update user_organization_roles
  const orgRole = role === "parent" ? "member" : role;
  const { error: orgRoleUpdateError } = await supabase
    .from("user_organization_roles")
    .update({ role: orgRole })
    .eq("user_id", user_id)
    .eq("organization_id", userOrgRole.organization_id);

  if (orgRoleUpdateError) {
    return { error: `Failed to update organization role: ${orgRoleUpdateError.message}` };
  }

  // Update user_roles
  const final_team_id = role === "admin" ? null : team_id;

  const { data: existingRole, error: findError } = await supabase.from("user_roles").select("id").eq("user_id", user_id).single();

  if (findError || !existingRole) {
    // Create new user_roles entry if it doesn't exist
    const { error: insertError } = await supabase.from("user_roles").insert({ user_id, role, team_id: final_team_id });

    if (insertError) {
      return { error: `Failed to create user role: ${insertError.message}` };
    }
  } else {
    // Update existing user_roles entry
    const { error: updateError } = await supabase.from("user_roles").update({ role, team_id: final_team_id }).eq("id", existingRole.id);

    if (updateError) {
      return { error: `Failed to update user role: ${updateError.message}` };
    }
  }

  revalidatePath("/dashboard/admin/users");
  return { success: "User role updated successfully." };
}
