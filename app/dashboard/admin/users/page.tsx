// app/dashboard/admin/users/page.tsx

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { InviteUserForm } from "./components/invite-user-form"; // Make sure this is imported

// Change #1: Force this page to be dynamically rendered, never cached.
export const dynamic = "force-dynamic";

async function UserManagementPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Change #2: Use supabase.auth.getUser() instead of getSession().
  // This always revalidates the session on the server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if the user is an admin
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id) // Use user.id from the getUser() call
    .single();

  if (userRole?.role !== "admin") {
    // Or redirect to a generic 'unauthorized' page
    return <p className="p-8">You do not have permission to view this page.</p>;
  }

  // Fetch data for the page (this part is the same)
  const { data: users } = await supabase.auth.admin.listUsers();
  const { data: teams } = await supabase.from("teams").select("*");
  const { data: roles } = await supabase
    .from("user_roles")
    .select("*, teams(name)");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="grid gap-8 mt-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">Invite New User</h2>
          <InviteUserForm teams={teams ?? []} />
        </div>
        <div className="mt-8 md:col-span-2 md:mt-0">
          <h2 className="text-xl font-semibold">Current Users</h2>
          <div className="p-4 mt-4 border rounded-md">
            {users?.users.map((user) => {
              const roleInfo = roles?.find((r) => r.user_id === user.id);
              return (
                <div
                  key={user.id}
                  className="flex justify-between py-2 border-b"
                >
                  <div>
                    <p>{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Role: {roleInfo?.role || "Not set"} | Team:{" "}
                      {roleInfo?.teams?.name || "N/A"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagementPage;
