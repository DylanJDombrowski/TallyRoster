// app/dashboard/admin/users/page.tsx
"use client"; // Convert to client component to manage modal state

import { Modal } from "@/app/components/modal";
import { createClient } from "@/lib/supabase/client";
import { Team } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { EditUserForm, EditableUser } from "./components/edit-user-form";
import { InviteUserForm } from "./components/invite-user-form";

type UserWithRole = User & {
  role: string;
  team_id: string | null;
  team_name: string | null;
};

// This page now needs to be a client component to handle state for the modal
export default function UserManagementPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch users
      const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }

      // Fetch all roles and teams
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("*, teams(name)");
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        return;
      }

      // Fetch all teams for the forms
      const { data: allTeams, error: teamsError } = await supabase.from("teams").select("*");
      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        return;
      }
      setTeams(allTeams ?? []);

      // Combine user and role data
      const combinedUsers = authUsers.users.map((user) => {
        const roleInfo = roles?.find((r) => r.user_id === user.id);
        return {
          ...user,
          role: roleInfo?.role || "Not Set",
          team_id: roleInfo?.team_id || null,
          team_name: roleInfo?.teams?.name || "N/A",
        };
      });

      setUsers(combinedUsers);
    }

    fetchData();
  }, [supabase]);

  const handleEditClick = (user: UserWithRole) => {
    setSelectedUser({
      id: user.id,
      email: user.email,
      role: user.role,
      team_id: user.team_id,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="grid gap-8 mt-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold">Invite New User</h2>
            <InviteUserForm teams={teams} />
          </div>
          <div className="mt-8 md:col-span-2 md:mt-0">
            <h2 className="text-xl font-semibold">Current Users</h2>
            <div className="p-4 mt-4 border rounded-md">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p>{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Role: {user.role} | Team: {user.team_name}
                    </p>
                  </div>
                  <button onClick={() => handleEditClick(user)} className="text-sm text-blue-600 hover:underline">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Edit User: ${selectedUser.email}`}>
          <EditUserForm user={selectedUser} teams={teams} onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </>
  );
}
