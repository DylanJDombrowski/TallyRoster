// app/dashboard/admin/users/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getOrganizationUsers } from "./actions";
import { UserManagementClient } from "./components/user-management-client";

export default async function UserManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get current user for preventing self-modification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          Authentication Error
        </h1>
        <p className="text-red-500">Please log in to access this page.</p>
      </div>
    );
  }

  const result = await getOrganizationUsers();

  // Check if result has an error
  if ("error" in result) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-red-500">{result.error}</p>
      </div>
    );
  }

  // At this point, TypeScript knows result has users and teams
  return (
    <UserManagementClient
      users={result.users}
      teams={result.teams}
      currentUserId={user.id}
    />
  );
}
