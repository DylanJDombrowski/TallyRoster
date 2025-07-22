// Update your user-management-client.tsx

"use client";

import { Modal } from "@/app/components/modal";
import { Team } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { removeUser, resendInvitation } from "../actions";
import { EditUserForm, EditableUser } from "./edit-user-form";
import { InviteUserForm } from "./invite-user-form";

type UserWithRole = User & {
  role: string;
  team_id: string | null;
  team_name: string | null;
  status?: string; // Add status field
};

interface UserManagementClientProps {
  users: UserWithRole[];
  teams: Team[];
}

export function UserManagementClient({ users, teams }: UserManagementClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);

  const handleEditClick = (user: UserWithRole) => {
    setSelectedUser({
      id: user.id,
      email: user.email,
      role: user.role,
      team_id: user.team_id,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: UserWithRole) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const formData = new FormData();
    formData.append("user_id", userToDelete.id);

    const result = await removeUser(null, formData);

    if (result.success) {
      alert(result.success);
      window.location.reload(); // Simple refresh - you could make this more elegant
    } else {
      alert(result.error);
    }

    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleResendInvitation = async (email: string) => {
    const formData = new FormData();
    formData.append("email", email);

    const result = await resendInvitation(null, formData);

    if (result.success) {
      alert(result.success);
    } else {
      alert(result.error);
    }
  };

  const getStatusBadge = (user: UserWithRole) => {
    const status = user.status || "active";

    const styles = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      setup_required: "bg-blue-100 text-blue-800",
      unknown: "bg-gray-100 text-gray-800",
    };

    const labels = {
      active: "Active",
      pending: "Pending",
      setup_required: "Setup Required",
      unknown: "Unknown",
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
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
            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                  <span className="col-span-2">User</span>
                  <span>Role</span>
                  <span>Team</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
              </div>

              {users.map((user) => (
                <div key={user.id} className="px-4 py-3 border-b hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                    </div>

                    <div>
                      <span className="text-sm text-slate-700 capitalize">{user.role}</span>
                    </div>

                    <div>
                      <span className="text-sm text-slate-700">{user.team_name || "N/A"}</span>
                    </div>

                    <div>{getStatusBadge(user)}</div>

                    <div className="flex space-x-2">
                      <button onClick={() => handleEditClick(user)} className="text-sm text-blue-600 hover:text-blue-800">
                        Edit
                      </button>

                      {user.status === "pending" && (
                        <button onClick={() => handleResendInvitation(user.email!)} className="text-sm text-green-600 hover:text-green-800">
                          Resend
                        </button>
                      )}

                      <button onClick={() => handleDeleteClick(user)} className="text-sm text-red-600 hover:text-red-800">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">No users found. Invite your first user above!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit User: ${selectedUser.email}`}>
          <EditUserForm user={selectedUser} teams={teams} onClose={() => setIsEditModalOpen(false)} />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Remove User">
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to remove <strong>{userToDelete.email}</strong>? This action cannot be undone.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 text-sm">
                <strong>Warning:</strong> This will:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Remove the user from your organization</li>
                  <li>Delete their role and team assignments</li>
                  <li>Permanently delete their account</li>
                </ul>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Remove User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
