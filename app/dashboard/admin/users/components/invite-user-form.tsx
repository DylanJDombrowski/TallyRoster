// app/dashboard/admin/users/components/invite-user-form.tsx
"use client";

import { Team } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { inviteUser } from "../actions";

interface InviteUserFormProps {
  teams: Team[];
}

// Separate button component to use the useFormStatus hook
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-800"
    >
      {pending ? "Sending Invite..." : "Send Invite"}
    </button>
  );
}

export function InviteUserForm({ teams }: InviteUserFormProps) {
  // useFormState is the React Hook for managing form state with Server Actions
  const [state, formAction] = useFormState(inviteUser, null);
  const [selectedRole, setSelectedRole] = useState("coach");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // If the form submission was successful, clear the form
    if (state?.success) {
      alert(state.success);
      formRef.current?.reset();
      setSelectedRole("coach");
    }
    if (state?.error) {
      alert(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="p-4 space-y-4 border rounded-md shadow-sm">
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-900">
          User Email
        </label>
        <input type="email" id="email" name="email" required className="w-full p-2 border border-gray-300 rounded-md" />
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="block text-sm font-medium text-slate-900">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {/* Only show the team selector if the role is 'coach' or 'parent' */}
      {(selectedRole === "coach" || selectedRole === "parent") && (
        <div className="space-y-1">
          <label htmlFor="team_id" className="block text-sm font-medium text-slate-900">
            Team
          </label>
          <select id="team_id" name="team_id" required className="w-full p-2 border border-gray-300 rounded-md">
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
