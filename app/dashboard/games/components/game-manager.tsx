// app/dashboard/games/components/game-manager.tsx
"use client";

import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type Game = Database["public"]["Tables"]["games"]["Row"] & {
  teams: { name: string };
};

interface GameManagerProps {
  teams: Team[];
  initialGames: Game[];
  organizationId: string;
}

export function GameManager({ teams, initialGames, organizationId }: GameManagerProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    team_id: "",
    opponent: "",
    game_date: "",
    location: "",
    home_score: 0,
    away_score: 0,
    inning: 1,
    status: "scheduled" as "scheduled" | "live" | "completed",
    is_home: true,
  });

  const resetForm = () => {
    setFormData({
      team_id: "",
      opponent: "",
      game_date: "",
      location: "",
      home_score: 0,
      away_score: 0,
      inning: 1,
      status: "scheduled",
      is_home: true,
    });
    setIsCreating(false);
    setEditingGame(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGame) {
        // Update existing game
        const { data, error } = await supabase
          .from("games")
          .update({
            ...formData,
            organization_id: organizationId,
          })
          .eq("id", editingGame.id)
          .select(
            `
            *,
            teams!inner(name)
          `
          )
          .single();

        if (error) throw error;

        setGames(games.map((g) => (g.id === editingGame.id ? data : g)));
      } else {
        // Create new game
        const { data, error } = await supabase
          .from("games")
          .insert({
            ...formData,
            organization_id: organizationId,
          })
          .select(
            `
            *,
            teams!inner(name)
          `
          )
          .single();

        if (error) throw error;

        setGames([data, ...games]);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save game");
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      team_id: game.team_id || "",
      opponent: game.opponent,
      game_date: game.game_date,
      location: game.location || "",
      home_score: game.home_score || 0,
      away_score: game.away_score || 0,
      inning: game.inning || 1,
      status: (game.status || "scheduled") as "scheduled" | "live" | "completed",
      is_home: game.is_home || true,
    });
    setIsCreating(true);
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    try {
      const { error } = await supabase.from("games").delete().eq("id", gameId);

      if (error) throw error;

      setGames(games.filter((g) => g.id !== gameId));
    } catch (error) {
      console.error("Error deleting game:", error);
      alert("Failed to delete game");
    }
  };

  const updateScore = async (gameId: string, homeScore: number, awayScore: number, inning: number, status: string) => {
    try {
      const { data, error } = await supabase
        .from("games")
        .update({
          home_score: homeScore,
          away_score: awayScore,
          inning: inning,
          status: status,
        })
        .eq("id", gameId)
        .select(
          `
          *,
          teams!inner(name)
        `
        )
        .single();

      if (error) throw error;

      setGames(games.map((g) => (g.id === gameId ? data : g)));
    } catch (error) {
      console.error("Error updating score:", error);
      alert("Failed to update score");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Game Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{editingGame ? "Edit Game" : "Create New Game"}</h2>
          <div className="space-x-2">
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Add Game
              </button>
            )}
            {isCreating && (
              <button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                Cancel
              </button>
            )}
          </div>
        </div>

        {isCreating && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
              <input
                type="text"
                value={formData.opponent}
                onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Game Date</label>
              <input
                type="date"
                value={formData.game_date}
                onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "scheduled" | "live" | "completed" })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_home"
                checked={formData.is_home}
                onChange={(e) => setFormData({ ...formData, is_home: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_home" className="text-sm font-medium text-gray-700">
                Home Game
              </label>
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                {editingGame ? "Update Game" : "Create Game"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Games List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Games</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(game.game_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.teams.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.opponent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {game.is_home ? (
                      <span>
                        {game.home_score || 0} - {game.away_score || 0}
                      </span>
                    ) : (
                      <span>
                        {game.away_score || 0} - {game.home_score || 0}
                      </span>
                    )}
                    {game.status === "live" && <span className="ml-2 text-xs text-blue-600">(Inning {game.inning || 1})</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        game.status === "live"
                          ? "bg-green-100 text-green-800"
                          : game.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {game.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(game)} className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(game.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                    {game.status === "live" && <LiveScoreUpdater game={game} onScoreUpdate={updateScore} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {games.length === 0 && <div className="p-6 text-center text-gray-500">No games found. Create your first game above.</div>}
      </div>
    </div>
  );
}

// Live Score Updater Component
function LiveScoreUpdater({
  game,
  onScoreUpdate,
}: {
  game: Game;
  onScoreUpdate: (gameId: string, homeScore: number, awayScore: number, inning: number, status: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [scores, setScores] = useState({
    home: game.home_score || 0,
    away: game.away_score || 0,
    inning: game.inning || 1,
    status: game.status || "live",
  });

  const handleUpdate = () => {
    onScoreUpdate(game.id, scores.home, scores.away, scores.inning, scores.status);
    setIsUpdating(false);
  };

  if (!isUpdating) {
    return (
      <button onClick={() => setIsUpdating(true)} className="text-green-600 hover:text-green-900 text-xs">
        Update Score
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Update Live Score</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {game.is_home ? game.teams.name : game.opponent} (Home)
              </label>
              <input
                type="number"
                value={scores.home}
                onChange={(e) => setScores({ ...scores, home: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {game.is_home ? game.opponent : game.teams.name} (Away)
              </label>
              <input
                type="number"
                value={scores.away}
                onChange={(e) => setScores({ ...scores, away: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inning</label>
            <input
              type="number"
              value={scores.inning}
              onChange={(e) => setScores({ ...scores, inning: parseInt(e.target.value) || 1 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              min="1"
              max="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={scores.status}
              onChange={(e) => setScores({ ...scores, status: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setIsUpdating(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Update Score
          </button>
        </div>
      </div>
    </div>
  );
}
