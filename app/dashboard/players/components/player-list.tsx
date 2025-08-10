// app/dashboard/players/components/player-list.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Player } from "@/lib/types";
import { deletePlayer, updatePlayerStatus } from "@/lib/actions";
import { PlayerWithTeam } from "./player-manager";

interface PlayerListProps {
  players: PlayerWithTeam[];
  onEdit: (player: Player) => void;
  onDeleteSuccess: (deletedPlayerId: string) => void;
  view: "active" | "archived";
}

function StatusButton({
  player,
  status,
}: {
  player: Player;
  status: "active" | "archived";
}) {
  const { showToast } = useToast();
  const actionText = status === "active" ? "Archive" : "Restore";

  const handleAction = async (formData: FormData) => {
    const result = await updatePlayerStatus(formData);
    if (!result.success) {
      showToast(result.error, "error");
    } else {
      showToast(result.data.message, "success");
    }
  };

  return (
    <form action={handleAction}>
      <input type="hidden" name="playerId" value={player.id} />
      <input
        type="hidden"
        name="status"
        value={status === "active" ? "archived" : "active"}
      />
      <button type="submit" className="text-sm text-yellow-600 hover:underline">
        {actionText}
      </button>
    </form>
  );
}

export function PlayerList({
  players,
  onEdit,
  onDeleteSuccess,
  view,
}: PlayerListProps) {
  const { showToast } = useToast();

  const handleDelete = async (player: Player) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete ${player.first_name} ${player.last_name}? This cannot be undone.`
      )
    ) {
      const result = await deletePlayer(player.id);
      if (!result.success) {
        showToast(result.error, "error");
      } else {
        showToast(result.data.message, "success");
        onDeleteSuccess(player.id);
      }
    }
  };

  if (players.length === 0) {
    return <p className="text-slate-800">No {view} players found.</p>;
  }

  return (
    <div className="space-y-4">
      {players.map((player) => (
        <div
          key={player.id}
          className="p-4 bg-white border rounded-md flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-slate-900">
              {player.first_name} {player.last_name} #{player.jersey_number}
            </p>
            <p className="text-sm text-slate-600">{player.teams?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <StatusButton player={player} status={view} />
            <button
              onClick={() => onEdit(player)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(player)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
