// app/sites/[subdomain]/live-scores/components/live-scoreboard.tsx
"use client";

import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Game = Database["public"]["Tables"]["games"]["Row"] & {
  teams: { name: string };
};

interface LiveScoreboardProps {
  games: Game[];
}

export function LiveScoreboard({ games: initialGames }: LiveScoreboardProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("all");
  const supabase = createClient();

  // Set up real-time subscription for game updates
  useEffect(() => {
    const channel = supabase
      .channel("game-scores")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `status=in.(live,completed,scheduled)`,
        },
        (payload) => {
          console.log("Real-time game update:", payload);
          // Update the specific game that changed
          setGames((currentGames) =>
            currentGames.map((game) => (game.id === payload.new.id ? ({ ...game, ...payload.new } as Game) : game))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredGames = games.filter((game) => {
    if (filter === "all") return true;
    return game.status === filter;
  });

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-1c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Games Scheduled</h3>
        <p className="text-gray-600">Check back later for live scores and upcoming games.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "live", "scheduled"].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === filterOption ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filterOption === "all"
              ? `All Games (${games.length})`
              : `${filterOption.charAt(0).toUpperCase() + filterOption.slice(1)} (${
                  games.filter((g) => g.status === filterOption).length
                })`}
          </button>
        ))}
      </div>

      {/* Live Games Section */}
      {filter === "all" && games.some((game) => game.status === "live") && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Live Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games
              .filter((game) => game.status === "live")
              .map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
          </div>
        </div>
      )}

      {/* All Games or Filtered Games */}
      <div>
        {filter !== "all" && (
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{filter.charAt(0).toUpperCase() + filter.slice(1)} Games</h2>
        )}

        {filteredGames.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No {filter === "all" ? "" : filter} games found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Game Card Component
function GameCard({ game }: { game: Game }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "live":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      case "scheduled":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{formatDate(game.game_date)}</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(game.status)} ${
              game.status === "live" ? "animate-pulse" : ""
            }`}
          >
            {(game.status || "scheduled").toUpperCase()}
            {game.status === "live" && <span className="ml-1">• {game.inning ? `T${game.inning}` : "1ST"}</span>}
          </span>
        </div>
      </div>

      {/* Game Content */}
      <div className="p-4">
        {/* Teams and Score */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{game.is_home ? "HOME" : "AWAY"}</span>
              <span className="font-semibold text-gray-800">{game.is_home ? game.teams.name : game.opponent}</span>
            </div>
            <span
              className={`text-xl font-bold ${game.status === "completed" || game.status === "live" ? "text-gray-800" : "text-gray-400"}`}
            >
              {game.status === "scheduled" ? "-" : game.home_score || 0}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{game.is_home ? "AWAY" : "HOME"}</span>
              <span className="font-semibold text-gray-800">{game.is_home ? game.opponent : game.teams.name}</span>
            </div>
            <span
              className={`text-xl font-bold ${game.status === "completed" || game.status === "live" ? "text-gray-800" : "text-gray-400"}`}
            >
              {game.status === "scheduled" ? "-" : game.away_score || 0}
            </span>
          </div>
        </div>

        {/* Game Details */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          {game.location && (
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {game.location}
            </div>
          )}

          {game.status === "live" && (
            <div className="flex items-center text-sm text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live - Inning {game.inning || 1}
            </div>
          )}

          {game.status === "scheduled" && <div className="text-sm text-blue-600">Game starts soon</div>}

          {game.status === "completed" && <div className="text-sm text-gray-600">Final Score</div>}
        </div>
      </div>
    </div>
  );
}
