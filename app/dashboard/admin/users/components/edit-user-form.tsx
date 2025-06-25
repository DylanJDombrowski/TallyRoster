// app/dashboard/admin/users/components/edit-user-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Team } from "@/lib/types";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateUserRole } from "../actions";

// Define a richer user type for the form
export type EditableUser = {
  id: string;
  email: string | undefined;
  role: string;
  team_id: string | null;
};

interface EditUserFormProps {
  user: EditableUser;
  teams: Team[];
  onClose: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export function EditUserForm({ user, teams, onClose }: EditUserFormProps) {
  const { showToast } = useToast();
  const [state, formAction] = useFormState(updateUserRole, null);
  const [selectedRole, setSelectedRole] = useState(user.role);

  useEffect(() => {
    if (state?.success) {
      showToast(state.success, "success");
      onClose();
    }
    if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="user_id" value={user.id} />
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <p className="mt-1 p-2 border border-gray-200 rounded-md bg-gray-50">{user.email}</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue={user.role}
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {(selectedRole === "coach" || selectedRole === "parent") && (
        <div className="space-y-1">
          <label htmlFor="team_id" className="block text-sm font-medium text-gray-700">
            Team
          </label>
          <select
            id="team_id"
            name="team_id"
            defaultValue={user.team_id ?? ""}
            required={true}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
