// app/dashboard/admin/users/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function UserManagementPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // 1. Check for active session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // 2. Check if the user is an admin
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (userRole?.role !== "admin") {
    // Or redirect to a generic 'unauthorized' page
    return <p className="p-8">You do not have permission to view this page.</p>;
  }

  // 3. Fetch data for the page
  const { data: users } = await supabase.auth.admin.listUsers();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("*, teams(name)");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="mt-8">
        {/* We will build this form component in the next step */}
        <h2 className="text-xl font-semibold">Invite New User</h2>
        {/* <InviteUserForm teams={teams ?? []} /> */}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Current Users</h2>
        <div className="p-4 mt-4 border rounded-md">
          {/* This is a simplified list. You can make this a nice table. */}
          {users?.users.map((user) => {
            const roleInfo = roles?.find((r) => r.user_id === user.id);
            return (
              <div key={user.id} className="flex justify-between py-2 border-b">
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
  );
}

export default UserManagementPage;
