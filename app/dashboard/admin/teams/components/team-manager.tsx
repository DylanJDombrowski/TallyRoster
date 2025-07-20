// app/dashboard/admin/teams/components/team-manager.tsx

"use client";

import { Team } from "@/lib/types";
import { useCallback, useState } from "react";
import { TeamForm } from "./team-form";
import { TeamList } from "./team-list";

interface TeamManagerProps {
  initialTeams: Team[];
}

export function TeamManager({ initialTeams }: TeamManagerProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  // NEW: State to control form visibility on mobile
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSaveSuccess = useCallback((savedTeam: Team, isNew: boolean) => {
    if (isNew) {
      setTeams((prevTeams) => [...prevTeams, savedTeam]);
    } else {
      setTeams((prevTeams) => prevTeams.map((t) => (t.id === savedTeam.id ? savedTeam : t)));
    }
    setEditingTeam(null);
    setIsFormVisible(false); // Hide form on mobile after saving
  }, []);

  const handleDeleteSuccess = useCallback((deletedTeamId: string) => {
    setTeams((prevTeams) => prevTeams.filter((t) => t.id !== deletedTeamId));
  }, []);

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsFormVisible(true); // Show form when editing on mobile
  };

  const handleCancel = () => {
    setEditingTeam(null);
    setIsFormVisible(false);
  };

  return (
    // UPDATED: Use a more responsive grid layout
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Form Column - Hidden on mobile unless toggled */}
      <div className={`lg:col-span-1 ${isFormVisible ? "block" : "hidden"} lg:block`}>
        <TeamForm teamToEdit={editingTeam} onSaveSuccess={handleSaveSuccess} onCancelEdit={handleCancel} />
      </div>

      {/* List Column */}
      <div className="lg:col-span-2">
        {/* Mobile-only button to show the form */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => {
              setEditingTeam(null); // Ensure it's a new team form
              setIsFormVisible(!isFormVisible);
            }}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            {isFormVisible ? "Close Form" : "Add New Team"}
          </button>
        </div>
        <TeamList teams={teams} onEdit={handleEdit} onDeleteSuccess={handleDeleteSuccess} />
      </div>
    </div>
  );
}
