// app/dashboard/admin/users/page.tsx
import { getOrganizationUsers } from "./actions";
import { UserManagementClient } from "./components/user-management-client";

export default async function UserManagementPage() {
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
  return <UserManagementClient users={result.users} teams={result.teams} />;
}
