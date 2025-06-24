// app/dashboard/players/components/player-manager.tsx
"use client";

import { useState } from "react";
import { PlayerForm } from "./player-form";
import { PlayerList } from "./player-list";
import { Player, Team } from "@/lib/types";

// Define the shape of the player data we're receiving from the server
export type PlayerWithTeam = Player & {
  teams: Pick<Team, "name"> | null;
};

interface PlayerManagerProps {
  initialPlayers: PlayerWithTeam[];
  teams: Team[];
}

export function PlayerManager({ initialPlayers, teams }: PlayerManagerProps) {
  // State to hold the list of players, so we can update it without a full page refresh
  const [players, setPlayers] = useState<PlayerWithTeam[]>(initialPlayers);

  // State to hold the player currently being edited
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Callback function for when the form successfully saves a player
  const handleSaveSuccess = (savedPlayer: Player, isNew: boolean) => {
    if (isNew) {
      // For a new player, we need to fake the team data for immediate display
      const team = teams.find((t) => t.id === savedPlayer.team_id);
      const newPlayerWithTeam = {
        ...savedPlayer,
        teams: { name: team?.name || "Unknown" },
      };
      setPlayers((prevPlayers) => [...prevPlayers, newPlayerWithTeam]);
    } else {
      // For an updated player, find and replace them in the list
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === savedPlayer.id ? { ...p, ...savedPlayer } : p
        )
      );
    }
    // Clear the form after saving
    setEditingPlayer(null);
  };

  // Callback for when the delete button is clicked
  const handleDeleteSuccess = (deletedPlayerId: string) => {
    setPlayers((prevPlayers) =>
      prevPlayers.filter((p) => p.id !== deletedPlayerId)
    );
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <PlayerForm
          teams={teams}
          // Pass the currently editing player to the form
          playerToEdit={editingPlayer}
          // Pass the callback to be triggered on successful save
          onSaveSuccess={handleSaveSuccess}
          // Allow the form to cancel the edit
          onCancelEdit={() => setEditingPlayer(null)}
        />
      </div>
      <div className="md:col-span-2">
        <PlayerList
          players={players}
          // Pass a function to set the player to be edited
          onEdit={(player) => setEditingPlayer(player)}
          // Pass a function to handle successful deletion
          onDeleteSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
}
