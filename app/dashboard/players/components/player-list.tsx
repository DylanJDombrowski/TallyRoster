// app/dashboard/players/components/player-list.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { Player } from "@/lib/types";
import { PlayerWithTeam } from "./player-manager"; // Import from our new manager

interface PlayerListProps {
  players: PlayerWithTeam[];
  onEdit: (player: Player) => void;
  onDeleteSuccess: (deletedPlayerId: string) => void;
}

export function PlayerList({ players, onEdit, onDeleteSuccess }: PlayerListProps) {
  const supabase = createClient();

  const handleDelete = async (player: Player) => {
    if (window.confirm(`Are you sure you want to delete ${player.first_name} ${player.last_name}?`)) {
      const { error } = await supabase.from("players").delete().eq("id", player.id);
      if (error) {
        alert("Error deleting player: " + error.message);
      } else {
        alert("Player deleted successfully!");
        onDeleteSuccess(player.id);
      }
    }
  };

  if (players.length === 0) {
    return <p>No players found. Add one using the form!</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Current Roster</h2>
      {players.map((player) => (
        <div key={player.id} className="p-4 border rounded-md flex items-center justify-between">
          <div>
            <p className="font-semibold">
              {player.first_name} {player.last_name} #{player.jersey_number}
            </p>
            <p className="text-sm text-slate-800">{player.teams?.name}</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => onEdit(player)} className="text-sm text-blue-600 hover:underline">
              Edit
            </button>
            <button onClick={() => handleDelete(player)} className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
