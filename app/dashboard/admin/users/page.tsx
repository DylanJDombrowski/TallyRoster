// app/dashboard/admin/users/page.tsx - Debug Version
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { UserManagementClient } from "./components/user-management-client";

type UserWithRole = User & {
  role: string;
  team_id: string | null;
  team_name: string | null;
};

export default async function UserManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log("🔍 Starting user management page load...");

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("❌ Auth error:", authError);
    return <div>Authentication required</div>;
  }
  console.log("✅ User authenticated:", user.email);

  // Step 1: Fetch users using admin API
  console.log("🔍 Fetching users via admin API...");
  const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error("❌ Error fetching users:", usersError);
    return <div>Error loading users: {usersError.message}</div>;
  }
  console.log("✅ Found users:", authUsers.users.length);

  // Step 2: Fetch all roles and teams
  console.log("🔍 Fetching user roles...");
  const { data: roles, error: rolesError } = await supabase.from("user_roles").select("*, teams(name)");
  if (rolesError) {
    console.error("❌ Error fetching roles:", rolesError);
    return <div>Error loading user roles: {rolesError.message}</div>;
  }
  console.log("✅ Found roles:", roles?.length || 0);

  // Step 3: Fetch all teams for the forms
  console.log("🔍 Fetching teams...");
  const { data: allTeams, error: teamsError } = await supabase.from("teams").select("*");
  if (teamsError) {
    console.error("❌ Error fetching teams:", teamsError);
    return <div>Error loading teams: {teamsError.message}</div>;
  }
  console.log("✅ Found teams:", allTeams?.length || 0);

  // Step 4: Combine user and role data
  console.log("🔍 Combining user and role data...");
  const combinedUsers: UserWithRole[] = authUsers.users.map((user) => {
    const roleInfo = roles?.find((r) => r.user_id === user.id);
    return {
      ...user,
      role: roleInfo?.role || "Not Set",
      team_id: roleInfo?.team_id || null,
      team_name: roleInfo?.teams?.name || "N/A",
    };
  });
  console.log("✅ Combined users ready:", combinedUsers.length);

  return <UserManagementClient users={combinedUsers} teams={allTeams ?? []} />;
}
