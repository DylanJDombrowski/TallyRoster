// app/dashboard/players/hooks/use-player-management.ts
"use client";

import { createClient } from "@/lib/supabase/client";
import { Player, Team } from "@/lib/types";
import { deletePlayer, updatePlayerStatus } from "@/lib/actions";
import { useCallback, useMemo, useState } from "react";
import { PlayerWithTeam } from "../../app/dashboard/players/components/player-manager";

interface UsePlayerManagementProps {
  initialPlayers: PlayerWithTeam[];
  teams: Team[];
  organizationId: string;
}

export function usePlayerManagement({
  initialPlayers,
  teams,
  organizationId,
}: UsePlayerManagementProps) {
  // State management
  const [players, setPlayers] = useState<PlayerWithTeam[]>(initialPlayers);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">(
    "active"
  );
  const [teamFilter, setTeamFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithTeam | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);

  const supabase = createClient();

  // Computed values
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.jersey_number?.toString().includes(searchTerm);

      const matchesStatus = player.status === statusFilter;
      const matchesTeam = !teamFilter || player.team_id === teamFilter;
      const matchesPosition =
        !positionFilter ||
        player.position?.toLowerCase().includes(positionFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesTeam && matchesPosition;
    });
  }, [players, searchTerm, statusFilter, teamFilter, positionFilter]);

  const activeCount = useMemo(
    () => players.filter((p) => p.status === "active").length,
    [players]
  );

  const alumniCount = useMemo(
    () => players.filter((p) => p.status === "archived").length,
    [players]
  );

  // Data fetching
  const fetchPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from("players")
      .select(`*, teams ( name )`)
      .eq("organization_id", organizationId);

    if (error) {
      console.error("Error fetching players:", error);
      return;
    }
    setPlayers(data as PlayerWithTeam[]);
  }, [supabase, organizationId]);

  // Player operations
  const handleSaveSuccess = useCallback(
    (savedPlayer: Player, isNew: boolean) => {
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
      setShowPlayerForm(false);
    },
    [teams]
  );

  const handleDeleteSuccess = useCallback((deletedPlayerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== deletedPlayerId));
  }, []);

  const handleDelete = useCallback(
    async (player: Player) => {
      if (
        window.confirm(
          `Are you sure you want to permanently delete ${player.first_name} ${player.last_name}? This cannot be undone.`
        )
      ) {
        try {
          const result = await deletePlayer(player.id);

          if (!result.success) {
            console.error("Delete failed:", result.error);
          } else {
            handleDeleteSuccess(player.id);
            console.log("Player deleted successfully:", result.data.message);
          }
        } catch (error) {
          console.error("Error deleting player:", error);
        }
      }
    },
    [handleDeleteSuccess]
  );

  const handleArchive = useCallback(async (player: Player) => {
    try {
      const formData = new FormData();
      formData.append("playerId", player.id);
      formData.append(
        "status",
        player.status === "active" ? "archived" : "active"
      );

      const result = await updatePlayerStatus(formData);

      if (!result.success) {
        console.error("Archive failed:", result.error);
      } else {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === player.id
              ? {
                  ...p,
                  status:
                    player.status === "active"
                      ? "archived"
                      : ("active" as const),
                }
              : p
          )
        );
        console.log("Player status updated successfully:", result.data.message);
      }
    } catch (error) {
      console.error("Error updating player status:", error);
    }
  }, []);

  // Modal and view handlers
  const handleViewDetails = useCallback((player: PlayerWithTeam) => {
    setSelectedPlayer(player);
    setShowDetailModal(true);
  }, []);

  const handleEdit = useCallback((player: PlayerWithTeam) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setTeamFilter("");
    setPositionFilter("");
    setSearchTerm("");
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedPlayer(null);
  }, []);

  const handleCloseCSVModal = useCallback(() => {
    setShowCSVModal(false);
  }, []);

  const handleClosePlayerForm = useCallback(() => {
    setShowPlayerForm(false);
    setEditingPlayer(null);
  }, []);

  return {
    // State
    players,
    editingPlayer,
    searchTerm,
    statusFilter,
    teamFilter,
    positionFilter,
    viewMode,
    showFilters,
    selectedPlayer,
    showDetailModal,
    showCSVModal,
    showPlayerForm,

    // Computed values
    filteredPlayers,
    activeCount,
    alumniCount,

    // State setters
    setSearchTerm,
    setStatusFilter,
    setTeamFilter,
    setPositionFilter,
    setViewMode,
    setShowFilters,
    setShowCSVModal,
    setShowPlayerForm,

    // Handlers
    fetchPlayers,
    handleSaveSuccess,
    handleDelete,
    handleArchive,
    handleViewDetails,
    handleEdit,
    handleClearFilters,
    handleCloseDetailModal,
    handleCloseCSVModal,
    handleClosePlayerForm,
  };
}
