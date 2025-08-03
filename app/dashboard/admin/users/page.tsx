// app/dashboard/admin/users/page.tsx
import { getOrganizationUsers } from "./actions";
import { UserManagementClient } from "./components/user-management-client";

export default async function UserManagementPage() {
  // No need to fetch user again - it's available in the session context
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

  // No need to pass currentUserId - the client component gets it from session context
  return <UserManagementClient users={result.users} teams={result.teams} />;
}
