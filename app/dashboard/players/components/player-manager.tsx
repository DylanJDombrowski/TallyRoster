// app/dashboard/players/components/player-manager.tsx
"use client";

import { Player, Team } from "@/lib/types";
import { useCallback, useMemo, useState } from "react";
import { PlayerForm } from "./player-form";
import { PlayerImporter } from "./player-importer";
import { PlayerList } from "./player-list";
import { createClient } from "@/lib/supabase/client";

export type PlayerWithTeam = Player & {
  teams: Pick<Team, "name"> | null;
};

interface PlayerManagerProps {
  initialPlayers: PlayerWithTeam[];
  teams: Team[];
  organizationId: string; // The manager now needs the organization ID for imports
}

export function PlayerManager({
  initialPlayers,
  teams,
  organizationId,
}: PlayerManagerProps) {
  const [players, setPlayers] = useState<PlayerWithTeam[]>(initialPlayers);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [view, setView] = useState<"active" | "archived">("active");
  const supabase = createClient();

  // A function to refetch players, which can be passed to the importer
  const fetchPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from("players")
      .select(
        `
        *,
        teams ( name )
      `
      )
      .eq("organization_id", organizationId); // Assuming players are filtered by org

    if (error) {
      console.error("Error fetching players:", error);
      return;
    }
    setPlayers(data as PlayerWithTeam[]);
  }, [supabase, organizationId]);

  const handleSaveSuccess = (savedPlayer: Player, isNew: boolean) => {
    const team = teams.find((t) => t.id === savedPlayer.team_id);

    const playerWithTeam = {
      ...savedPlayer,
      teams: team ? { name: team.name } : null,
    };

    if (isNew) {
      setPlayers((prev) => [...prev, playerWithTeam]);
    } else {
      setPlayers((prev) =>
        prev.map((p) => (p.id === savedPlayer.id ? playerWithTeam : p))
      );
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
      <div className="md:col-span-1 flex flex-col gap-8">
        <PlayerForm
          teams={teams}
          playerToEdit={editingPlayer}
          onSaveSuccess={handleSaveSuccess}
          onCancelEdit={() => setEditingPlayer(null)}
        />
        {/* The PlayerImporter is now integrated here */}
        <PlayerImporter
          teams={teams}
          organizationId={organizationId}
          onImportSuccess={fetchPlayers} // Pass the fetch function as the callback
        />
      </div>
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {view === "active" ? "Active Roster" : "Archived Players"}
          </h2>
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
