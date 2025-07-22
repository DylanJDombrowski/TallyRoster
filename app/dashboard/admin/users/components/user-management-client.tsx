// app/dashboard/admin/users/components/user-management-client.tsx
"use client";

import { Modal } from "@/app/components/modal";
import { Team } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { EditUserForm, EditableUser } from "./edit-user-form";
import { InviteUserForm } from "./invite-user-form";

type UserWithRole = User & {
  role: string;
  team_id: string | null;
  team_name: string | null;
};

interface UserManagementClientProps {
  users: UserWithRole[];
  teams: Team[];
}

export function UserManagementClient({ users, teams }: UserManagementClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);

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
        <h1 className="text-2xl text-slate-900 font-bold">User Management</h1>
        <div className="grid gap-8 mt-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <h2 className="text-xl text-slate-900 font-semibold">Invite New User</h2>
            <InviteUserForm teams={teams} />
          </div>
          <div className="mt-8 md:col-span-2 md:mt-0">
            <h2 className="text-xl text-slate-900 font-semibold">Current Users</h2>
            <div className="p-4 mt-4 border text-slate-900 rounded-md">
              {users.map((user) => (
                <div key={user.id} className="flex text-slate-800 justify-between items-center py-2 border-b">
                  <div>
                    <p>{user.email}</p>
                    <p className="text-sm text-slate-800">
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