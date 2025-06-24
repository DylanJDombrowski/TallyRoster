// app/dashboard/admin/teams/components/team-manager.tsx
"use client";

import { Team } from "@/lib/types";
import { useState } from "react";
import { TeamForm } from "./team-form";
import { TeamList } from "./team-list";

interface TeamManagerProps {
  initialTeams: Team[];
}

export function TeamManager({ initialTeams }: TeamManagerProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const handleSaveSuccess = (savedTeam: Team, isNew: boolean) => {
    if (isNew) {
      setTeams((prevTeams) => [...prevTeams, savedTeam]);
    } else {
      setTeams((prevTeams) => prevTeams.map((t) => (t.id === savedTeam.id ? savedTeam : t)));
    }
    setEditingTeam(null);
  };

  const handleDeleteSuccess = (deletedTeamId: string) => {
    setTeams((prevTeams) => prevTeams.filter((t) => t.id !== deletedTeamId));
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <TeamForm teamToEdit={editingTeam} onSaveSuccess={handleSaveSuccess} onCancelEdit={() => setEditingTeam(null)} />
      </div>
      <div className="md:col-span-2">
        <TeamList teams={teams} onEdit={(team) => setEditingTeam(team)} onDeleteSuccess={handleDeleteSuccess} />
      </div>
    </div>
  );
}
