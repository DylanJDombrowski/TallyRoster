// app/dashboard/admin/teams/components/team-list.tsx
"use client";

import { Team } from "@/lib/types";
import { User, Mail, Edit2, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { deleteTeam } from "@/lib/actions";

interface TeamListProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDeleteSuccess: (deletedTeamId: string) => void;
}

export function TeamList({ teams, onEdit, onDeleteSuccess }: TeamListProps) {
  const handleDelete = async (team: Team) => {
    const confirmMessage = `Are you sure you want to delete "${team.name}"?\n\nThis will also remove any coaches assigned to this team. This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      const result = await deleteTeam(team.id);
      if (result.error) {
        alert("Error deleting team: " + result.error);
      } else {
        onDeleteSuccess(team.id);
      }
    }
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No Teams Yet
        </h3>
        <p className="text-slate-600 mb-4">
          Create your first team to get started with player management and
          communications.
        </p>
        <p className="text-sm text-slate-500">
          Teams help organize players, assign coaches, and manage communications
          efficiently.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-slate-900 font-semibold flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Teams ({teams.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              {/* Team Info */}
              <div className="flex items-start space-x-4 flex-1">
                {/* Team Image/Colors */}
                <div className="flex-shrink-0">
                  {team.team_image_url ? (
                    <Image
                      src={team.team_image_url}
                      alt={`${team.name} logo`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg border-2"
                      style={{ borderColor: team.primary_color ?? "" }}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: team.primary_color ?? "" }}
                    >
                      {team.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Team Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {team.name}
                    </h3>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                      {team.season}
                    </span>
                    {team.year && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {team.year}
                      </span>
                    )}
                  </div>

                  {/* Color Indicators */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-slate-600">Team Colors:</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: team.primary_color ?? "" }}
                        title={`Primary: ${team.primary_color}`}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: team.secondary_color ?? "" }}
                        title={`Secondary: ${team.secondary_color}`}
                      />
                    </div>
                  </div>

                  {/* Coach Information Placeholder */}
                  <div className="flex items-center text-sm text-slate-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>Coach information will load when editing</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit(team)}
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit team and coach information"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(team)}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete team and remove coaches"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>

            {/* Team Stats/Info Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-slate-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Players: Loading...</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>Coach: Click edit to view</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Communications ready</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">
          💡 Team Management Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each team can have one primary coach assigned</li>
          <li>
            • Coach email addresses are automatically included in team
            communications
          </li>
          <li>• Team colors are used throughout the platform for branding</li>
          <li>
            • You can edit coach information anytime by clicking
            &quot;Edit&quot; on a team
          </li>
        </ul>
      </div>
    </div>
  );
}
