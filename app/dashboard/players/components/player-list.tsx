// app/dashboard/players/components/player-list.tsx
"use client";

import { Player, Team } from "@/lib/types";

// Define the shape of the player data we're receiving from the server
type PlayerWithTeam = Player & {
  teams: Pick<Team, "name"> | null;
};

interface PlayerListProps {
  players: PlayerWithTeam[];
}

export function PlayerList({ players }: PlayerListProps) {
  if (players.length === 0) {
    return <p>No players found. Add one using the form!</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Current Roster</h2>
      {players.map((player) => (
        <div
          key={player.id}
          className="p-4 border rounded-md flex items-center justify-between"
        >
          <div>
            <p className="font-semibold">
              {player.first_name} {player.last_name} #{player.jersey_number}
            </p>
            <p className="text-sm text-gray-500">{player.teams?.name}</p>
          </div>
          {/* Edit/Delete buttons will go here */}
        </div>
      ))}
    </div>
  );
}
