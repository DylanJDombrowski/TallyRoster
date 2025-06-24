// app/dashboard/admin/teams/components/team-list.tsx
"use client";

import { Team } from "@/lib/types";
import { deleteTeam } from "../actions";

interface TeamListProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDeleteSuccess: (deletedTeamId: string) => void;
}

export function TeamList({ teams, onEdit, onDeleteSuccess }: TeamListProps) {
  const handleDelete = async (team: Team) => {
    if (window.confirm(`Are you sure you want to delete ${team.name}?`)) {
      const result = await deleteTeam(team.id);
      if (result.error) {
        alert("Error deleting team: " + result.error);
      } else {
        alert("Team deleted successfully!");
        onDeleteSuccess(team.id);
      }
    }
  };

  if (teams.length === 0) {
    return <p>No teams found. Add one using the form!</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Current Teams</h2>
      {teams.map((team) => (
        <div key={team.id} className="p-4 border rounded-md flex items-center justify-between">
          <div>
            <p className="font-semibold">{team.name}</p>
            <p className="text-sm text-gray-500">{team.season}</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => onEdit(team)} className="text-sm text-blue-600 hover:underline">
              Edit
            </button>
            <button onClick={() => handleDelete(team)} className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
