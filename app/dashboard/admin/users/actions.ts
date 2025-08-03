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
export async function getOrganizationUsers(
  organizationId?: string
): Promise<GetUsersResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log("🔍 Getting organization users for org:", organizationId);

  // Get current user for admin verification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("❌ Auth error:", authError);
    return { error: "Authentication required" };
  }

  let targetOrgId = organizationId;

  // If no organizationId provided, fall back to fetching user's org (backwards compatibility)
  if (!targetOrgId) {
    const { data: userOrgRole, error: roleError } = await supabase
      .from("user_organization_roles")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !userOrgRole) {
      console.error("❌ User is not an admin:", roleError);
      return { error: "Admin access required" };
    }
    targetOrgId = userOrgRole.organization_id;
  } else {
    // Verify user is admin of the specified organization
    const { data: userOrgRole, error: roleError } = await supabase
      .from("user_organization_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", targetOrgId)
      .eq("role", "admin")
      .single();

    if (roleError || !userOrgRole) {
      console.error("❌ User is not an admin of specified org:", roleError);
      return { error: "Admin access required for this organization" };
    }
  }

  // Rest of the function remains the same, but uses targetOrgId
  const { data: orgUsers, error: orgUsersError } = await supabase
    .from("user_organization_roles")
    .select("user_id, role")
    .eq("organization_id", targetOrgId);

  if (orgUsersError) {
    console.error("❌ Error loading organization users:", orgUsersError);
    return {
      error: `Error loading organization users: ${orgUsersError.message}`,
    };
  }

  const userIds = orgUsers?.map((u) => u.user_id) || [];
  const { data: authData, error: authUsersError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (authUsersError) {
    console.error("❌ Error loading user details:", authUsersError);
    return { error: `Error loading user details: ${authUsersError.message}` };
  }

  const orgAuthUsers = authData.users.filter((authUser) =>
    userIds.includes(authUser.id)
  );

  const { data: userRoles, error: userRolesError } = await supabase
    .from("user_roles")
    .select("*, teams(name)")
    .in("user_id", userIds);

  if (userRolesError) {
    console.error("❌ Error loading user roles:", userRolesError);
    return { error: `Error loading user roles: ${userRolesError.message}` };
  }

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", targetOrgId);

  if (teamsError) {
    console.error("❌ Error loading teams:", teamsError);
    return { error: `Error loading teams: ${teamsError.message}` };
  }

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

  return {
    users: combinedUsers,
    teams: teams || [],
  };
}

export async function inviteUser(
  organizationId: string,
  currentUserId: string,
  email: string,
  role: "admin" | "coach" | "parent",
  teamId?: string | null
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Verify the current user is admin of the organization
  const { data: userOrgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("role, organizations(name)")
    .eq("user_id", currentUserId)
    .eq("organization_id", organizationId)
    .eq("role", "admin")
    .single();

  if (roleError || !userOrgRole) {
    return { error: "Admin access required" };
  }

  // Validate team requirement for coach/parent roles
  if ((role === "coach" || role === "parent") && !teamId) {
    return {
      error: `Team selection is required for ${role} role`,
      fields: { team_id: ["Please select a team"] },
    };
  }

  try {
    const orgName = Array.isArray(userOrgRole.organizations)
      ? userOrgRole.organizations[0]?.name
      : userOrgRole.organizations?.name || "Unknown Organization";

    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          invited_by: currentUserId,
          organization_id: organizationId,
          organization_name: orgName,
          assigned_role: role,
          team_id: teamId,
          invitation_type: "organization_invite",
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      });

    if (inviteError) {
      console.error("Failed to send invitation:", inviteError);
      return { error: `Failed to send invitation: ${inviteError.message}` };
    }

    if (!inviteData.user) {
      return { error: "Failed to create invitation" };
    }

    console.log(`✅ Invitation sent to ${email} for role: ${role}`);

    revalidatePath("/dashboard/admin/users");
    return { success: `Invitation sent successfully to ${email}` };
  } catch (error) {
    console.error("Error inviting user:", error);
    return { error: "Failed to send invitation. Please try again." };
  }
}

// Updated user role update function
const UpdateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "coach", "parent"]),
  team_id: z.string().uuid().optional().nullable(),
});

export async function removeUser(
  organizationId: string,
  currentUserId: string,
  userIdToRemove: string
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Verify the current user is admin of the organization
  const { data: userOrgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("role")
    .eq("user_id", currentUserId)
    .eq("organization_id", organizationId)
    .eq("role", "admin")
    .single();

  if (roleError || !userOrgRole) {
    return { error: "Admin access required" };
  }

  // Prevent self-removal
  if (userIdToRemove === currentUserId) {
    return { error: "You cannot remove yourself from the organization" };
  }

  try {
    // Remove from user_roles table
    const { error: userRolesError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userIdToRemove);

    if (userRolesError) {
      console.error("Error removing user roles:", userRolesError);
    }

    // Remove from user_organization_roles table
    const { error: orgRolesError } = await supabase
      .from("user_organization_roles")
      .delete()
      .eq("user_id", userIdToRemove)
      .eq("organization_id", organizationId);

    if (orgRolesError) {
      return {
        error: `Failed to remove user from organization: ${orgRolesError.message}`,
      };
    }

    // Check if user has any other organization memberships
    const { data: otherOrgRoles, error: otherOrgError } = await supabase
      .from("user_organization_roles")
      .select("organization_id")
      .eq("user_id", userIdToRemove);

    if (otherOrgError) {
      console.error("Error checking other org roles:", otherOrgError);
    }

    // If user has no other organization memberships, mark as inactive
    if (!otherOrgRoles || otherOrgRoles.length === 0) {
      const { error: profileUpdateError } = await supabase
        .from("user_profiles")
        .update({ status: "inactive" })
        .eq("user_id", userIdToRemove);

      if (profileUpdateError) {
        console.error(
          "Error updating user profile status:",
          profileUpdateError
        );
      }
    }

    revalidatePath("/dashboard/admin/users");
    return { success: "User removed successfully from the organization" };
  } catch (error) {
    console.error("Error removing user:", error);
    return { error: "Failed to remove user. Please try again." };
  }
}

// Resend invitation
export async function resendInvitation(
  organizationId: string,
  currentUserId: string,
  email: string
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Verify admin permissions
  const { data: userOrgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("role, organizations(name)")
    .eq("user_id", currentUserId)
    .eq("organization_id", organizationId)
    .eq("role", "admin")
    .single();

  if (roleError || !userOrgRole) {
    return { error: "Admin access required" };
  }

  try {
    const orgName = Array.isArray(userOrgRole.organizations)
      ? userOrgRole.organizations[0]?.name
      : userOrgRole.organizations?.name || "Unknown Organization";

    const { error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          invited_by: currentUserId,
          organization_id: organizationId,
          organization_name: orgName,
          invitation_type: "organization_reinvite",
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      });

    if (inviteError) {
      if (inviteError.message.includes("rate limit")) {
        return { error: "Rate limit reached. Please wait before resending." };
      }
      return { error: `Failed to resend invitation: ${inviteError.message}` };
    }

    return { success: `Invitation resent successfully to ${email}` };
  } catch (error) {
    console.error("Error resending invitation:", error);
    return { error: "Failed to resend invitation. Please try again." };
  }
}

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

  // Prevent self-modification
  if (user_id === user.id) {
    return { error: "You cannot modify your own role" };
  }

  // Update user_organization_roles
  const orgRole = role === "parent" ? "member" : role;
  const { error: orgRoleUpdateError } = await supabase
    .from("user_organization_roles")
    .update({ role: orgRole })
    .eq("user_id", user_id)
    .eq("organization_id", userOrgRole.organization_id);

  if (orgRoleUpdateError) {
    return {
      error: `Failed to update organization role: ${orgRoleUpdateError.message}`,
    };
  }

  // Update user_roles
  const final_team_id = role === "admin" ? null : team_id;

  const { data: existingRole, error: findError } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (findError || !existingRole) {
    // Create new user_roles entry if it doesn't exist
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id, role, team_id: final_team_id });

    if (insertError) {
      return { error: `Failed to create user role: ${insertError.message}` };
    }
  } else {
    // Update existing user_roles entry
    const { error: updateError } = await supabase
      .from("user_roles")
      .update({ role, team_id: final_team_id })
      .eq("id", existingRole.id);

    if (updateError) {
      return { error: `Failed to update user role: ${updateError.message}` };
    }
  }

  revalidatePath("/dashboard/admin/users");
  return { success: "User role updated successfully." };
}
