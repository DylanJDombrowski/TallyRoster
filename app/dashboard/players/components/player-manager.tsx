// app/dashboard/players/components/player-manager.tsx
"use client";

import { Player, Team } from "@/lib/types";
import { useMemo, useState } from "react";
import { PlayerForm } from "./player-form";
import { PlayerList } from "./player-list";

export type PlayerWithTeam = Player & {
  // status is now part of the base Player type from your database types
  teams: Pick<Team, "name"> | null;
};

interface PlayerManagerProps {
  initialPlayers: PlayerWithTeam[];
  teams: Team[];
}

export function PlayerManager({ initialPlayers, teams }: PlayerManagerProps) {
  const [players, setPlayers] = useState<PlayerWithTeam[]>(initialPlayers);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [view, setView] = useState<"active" | "archived">("active");

  const handleSaveSuccess = (savedPlayer: Player, isNew: boolean) => {
    const team = teams.find((t) => t.id === savedPlayer.team_id);

    // The savedPlayer from the DB now includes the 'status' field, so we don't need to add it manually.
    const playerWithTeam = {
      ...savedPlayer,
      teams: { name: team?.name || "Unknown" },
    };

    if (isNew) {
      setPlayers((prev) => [...prev, playerWithTeam]);
    } else {
      setPlayers((prev) => prev.map((p) => (p.id === savedPlayer.id ? playerWithTeam : p)));
    }
    setEditingPlayer(null);
  };

  const handleDeleteSuccess = (deletedPlayerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== deletedPlayerId));
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => p.status === view);
  }, [players, view]);

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <PlayerForm
          teams={teams}
          playerToEdit={editingPlayer}
          onSaveSuccess={handleSaveSuccess}
          onCancelEdit={() => setEditingPlayer(null)}
        />
      </div>
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{view === "active" ? "Active Roster" : "Archived Players"}</h2>
          <button
            onClick={() => setView(view === "active" ? "archived" : "active")}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View {view === "active" ? "Archived" : "Active"}
          </button>
        </div>
        <PlayerList
          players={filteredPlayers}
          onEdit={(player) => setEditingPlayer(player)}
          onDeleteSuccess={handleDeleteSuccess}
          view={view}
        />
      </div>
    </div>
  );
}
