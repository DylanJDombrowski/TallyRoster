// app/dashboard/admin/users/page.tsx
import { getSessionData } from "@/lib/actions";
import { redirect } from "next/navigation";
import { getOrganizationUsers } from "@/lib/actions";
import { UserManagementClient } from "./components/user-management-client";

export default async function UserManagementPage() {
  // Get session data from the cached function
  const sessionData = await getSessionData();

  // Handle authentication and authorization
  if (!sessionData.user) {
    redirect("/login");
  }

  if (!sessionData.currentOrg || sessionData.currentRole !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-red-500">Admin access required to manage users.</p>
      </div>
    );
  }

  // Now fetch page-specific data, passing the organization ID to avoid re-fetching
  const result = await getOrganizationUsers(sessionData.currentOrg.id);

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
