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
  const [isFormVisible, setIsFormVisible] = useState(false);

  // 🔧 FIX: Wrap in useCallback to prevent infinite re-renders
  const handleSaveSuccess = useCallback((savedTeam: Team, isNew: boolean) => {
    if (isNew) {
      setTeams((prevTeams) => [...prevTeams, savedTeam]);
    } else {
      setTeams((prevTeams) => prevTeams.map((t) => (t.id === savedTeam.id ? savedTeam : t)));
    }
    setEditingTeam(null);
    setIsFormVisible(false);
  }, []); // 🔧 Empty dependency array - this function never changes

  // 🔧 FIX: Wrap in useCallback to prevent infinite re-renders
  const handleDeleteSuccess = useCallback((deletedTeamId: string) => {
    setTeams((prevTeams) => prevTeams.filter((t) => t.id !== deletedTeamId));
  }, []); // 🔧 Empty dependency array - this function never changes

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setEditingTeam(null);
    setIsFormVisible(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Form Column */}
      <div className={`lg:col-span-1 ${isFormVisible ? "block" : "hidden"} lg:block`}>
        <TeamForm
          teamToEdit={editingTeam}
          onSaveSuccess={handleSaveSuccess}
          onCancelEdit={handleCancel}
          existingTeams={teams} // 🔧 Pass existing teams for validation
        />
      </div>

      {/* List Column */}
      <div className="lg:col-span-2">
        {/* Mobile-only button to show the form */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => {
              setEditingTeam(null);
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
