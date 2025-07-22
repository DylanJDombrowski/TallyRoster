// app/dashboard/admin/users/page.tsx
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

  // Fetch users using admin API on the server
  const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error("Error fetching users:", usersError);
    return <div>Error loading users</div>;
  }

  // Fetch all roles and teams
  const { data: roles, error: rolesError } = await supabase.from("user_roles").select("*, teams(name)");
  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
    return <div>Error loading user roles</div>;
  }

  // Fetch all teams for the forms
  const { data: allTeams, error: teamsError } = await supabase.from("teams").select("*");
  if (teamsError) {
    console.error("Error fetching teams:", teamsError);
    return <div>Error loading teams</div>;
  }

  // Combine user and role data
  const combinedUsers: UserWithRole[] = authUsers.users.map((user) => {
    const roleInfo = roles?.find((r) => r.user_id === user.id);
    return {
      ...user,
      role: roleInfo?.role || "Not Set",
      team_id: roleInfo?.team_id || null,
      team_name: roleInfo?.teams?.name || "N/A",
    };
  });

  return <UserManagementClient users={combinedUsers} teams={allTeams ?? []} />;
}
