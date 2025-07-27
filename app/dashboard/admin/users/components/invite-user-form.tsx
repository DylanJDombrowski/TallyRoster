// app/dashboard/admin/users/components/invite-user-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
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
      className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
    >
      {pending ? "Sending Invite..." : "Send Invite"}
    </button>
  );
}

export function InviteUserForm({ teams }: InviteUserFormProps) {
  const { showToast } = useToast();
  const [state, formAction] = useFormState(inviteUser, null);
  const [selectedRole, setSelectedRole] = useState("coach");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      showToast(state.success, "success");
      formRef.current?.reset();
      setSelectedRole("coach");
    }
    if (state?.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="p-4 space-y-4 border rounded-md shadow-sm"
    >
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-900"
        >
          User Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full p-2 border text-slate-800 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="user@example.com"
        />
        {state?.fields?.email && (
          <p className="text-sm text-red-600">{state.fields.email[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="role"
          className="block text-sm font-medium text-slate-900"
        >
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          required
          value={selectedRole}
          className="w-full p-2 border text-slate-800 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
          <option value="parent">Parent</option>
        </select>
        {state?.fields?.role && (
          <p className="text-sm text-red-600">{state.fields.role[0]}</p>
        )}
      </div>

      {/* Only show the team selector if the role is 'coach' or 'parent' */}
      {(selectedRole === "coach" || selectedRole === "parent") && (
        <div className="space-y-1">
          <label
            htmlFor="team_id"
            className="block text-sm font-medium text-slate-900"
          >
            Team <span className="text-red-500">*</span>
          </label>
          <select
            id="team_id"
            name="team_id"
            required
            className="w-full p-2 border text-slate-800 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.season && `(${team.season})`}
              </option>
            ))}
          </select>
          {state?.fields?.team_id && (
            <p className="text-sm text-red-600">{state.fields.team_id[0]}</p>
          )}
        </div>
      )}

      {/* Role description */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <h4 className="font-medium text-blue-900 mb-1">
          What this role can do:
        </h4>
        {selectedRole === "admin" && (
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Manage all teams and players</li>
            <li>• Invite and manage users</li>
            <li>• Access all organizational features</li>
            <li>• Customize organization settings</li>
          </ul>
        )}
        {selectedRole === "coach" && (
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Manage assigned team&apos;s players</li>
            <li>• Update game schedules and scores</li>
            <li>• Communicate with team members</li>
            <li>• View team analytics</li>
          </ul>
        )}
        {selectedRole === "parent" && (
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• View team schedule and scores</li>
            <li>• Access player information</li>
            <li>• Receive team communications</li>
            <li>• View team photos and updates</li>
          </ul>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
