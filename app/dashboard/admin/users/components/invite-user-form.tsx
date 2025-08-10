// app/dashboard/admin/users/components/invite-user-form.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { useSession } from "@/hooks/use-session";
import { Team } from "@/lib/types";
import { useRef, useState } from "react";
import { inviteUser } from "@/lib/actions";

interface InviteUserFormProps {
  teams: Team[];
}

export function InviteUserForm({ teams }: InviteUserFormProps) {
  const { showToast } = useToast();
  const { currentOrg, user } = useSession(); // Get org and user from session context
  const [selectedRole, setSelectedRole] = useState("coach");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentOrg || !user) {
      showToast("Session error. Please refresh the page.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const role = formData.get("role") as "admin" | "coach" | "parent";
      const teamId = (formData.get("team_id") as string) || null;

      // Call optimized server action with session data
      const result = await inviteUser(
        currentOrg.id,
        user.id,
        email,
        role,
        teamId
      );

      if (result.success) {
        showToast(result.success, "success");
        formRef.current?.reset();
        setSelectedRole("coach");
      } else {
        showToast(result.error || "Failed to send invitation", "error");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
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
          disabled={isSubmitting}
          className="w-full p-2 border text-slate-800 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="user@example.com"
        />
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
          disabled={isSubmitting}
          value={selectedRole}
          className="w-full p-2 border text-slate-800 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
            disabled={isSubmitting}
            className="w-full p-2 border text-slate-800 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.season && `(${team.season})`}
              </option>
            ))}
          </select>
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending Invite..." : "Send Invite"}
      </button>
    </form>
  );
}
