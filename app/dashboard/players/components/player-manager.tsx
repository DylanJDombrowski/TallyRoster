// app/dashboard/players/components/player-manager.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { Player, Team } from "@/lib/types";
import {
  Archive,
  Award,
  Calendar,
  Edit,
  Eye,
  Filter,
  GraduationCap,
  Grid,
  List,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Twitter,
  Upload,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { deletePlayer, updatePlayerStatus } from "../actions";
import { PlayerForm } from "./player-form";

export type PlayerWithTeam = Player & {
  teams: Pick<Team, "name"> | null;
};

interface PlayerManagerProps {
  initialPlayers: PlayerWithTeam[];
  teams: Team[];
  organizationId: string;
}

interface PlayerCardProps {
  player: PlayerWithTeam;
  isCompact: boolean;
  onEdit: (player: PlayerWithTeam) => void;
  onArchive: (player: PlayerWithTeam) => void;
  onDelete: (player: PlayerWithTeam) => void;
  onViewDetails: (player: PlayerWithTeam) => void;
}

const PlayerCard = ({ player, isCompact, onEdit, onArchive, onDelete, onViewDetails }: PlayerCardProps) => {
  const defaultAvatar = "/assets/teams/defaultpfp.jpg";

  if (isCompact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={player.headshot_url || defaultAvatar}
              alt={`${player.first_name} ${player.last_name}`}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {player.first_name} {player.last_name}
              </h3>
              <p className="text-sm text-gray-500">
                #{player.jersey_number} • {player.position}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => onViewDetails(player)} className="p-1 text-gray-400 hover:text-blue-600">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => onEdit(player)} className="p-1 text-gray-400 hover:text-blue-600">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Image
              src={player.headshot_url || defaultAvatar}
              alt={`${player.first_name} ${player.last_name}`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {player.first_name} {player.last_name}
              </h3>
              <p className="text-gray-600">
                #{player.jersey_number} • {player.position}
              </p>
              <p className="text-sm text-blue-600 font-medium">{player.teams?.name}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(player)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onArchive(player)}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(player)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Class of {player.grad_year || "N/A"}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {player.town || "N/A"}
          </div>
          {player.height && (
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {player.height}
            </div>
          )}
          {player.gpa && (
            <div className="flex items-center text-gray-600">
              <Award className="w-4 h-4 mr-2" />
              {player.gpa} GPA
            </div>
          )}
        </div>

        {(player.bats || player.throws) && (
          <div className="mt-3 flex space-x-4 text-xs text-gray-500">
            {player.bats && <span>Bats: {player.bats}</span>}
            {player.throws && <span>Throws: {player.throws}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

interface PlayerDetailModalProps {
  player: PlayerWithTeam | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerDetailModal = ({ player, isOpen, onClose }: PlayerDetailModalProps) => {
  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <Image
              src={player.headshot_url || "/assets/teams/defaultpfp.jpg"}
              alt={`${player.first_name} ${player.last_name}`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {player.first_name} {player.last_name}
              </h2>
              <p className="text-lg text-gray-600">
                #{player.jersey_number} • {player.position}
              </p>
              <p className="text-blue-600 font-medium">{player.teams?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Personal Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Height:</span>
                <span>{player.height || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Town:</span>
                <span>{player.town || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">School:</span>
                <span>{player.school || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Graduation:</span>
                <span>{player.grad_year || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GPA:</span>
                <span>{player.gpa || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Baseball Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bats:</span>
                <span>{player.bats || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Throws:</span>
                <span>{player.throws || "Not provided"}</span>
              </div>
              {player.twitter_handle && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Twitter:</span>
                  <span className="flex items-center">
                    <Twitter className="w-3 h-3 mr-1" />@{player.twitter_handle}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(player.parent_email || player.parent_phone) && (
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                {player.parent_email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{player.parent_email}</span>
                  </div>
                )}
                {player.parent_phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{player.parent_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  organizationId: string;
  onImportSuccess: () => void;
}

const CSVImportModal = ({ isOpen, onClose, teams, organizationId, onImportSuccess }: CSVImportModalProps) => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "first_name,last_name,jersey_number,position,grad_year,height,town,school\n" +
      "John,Doe,23,Pitcher,2025,6'2\",Louisville,Central High\n" +
      "Jane,Smith,15,Catcher,2026,5'6\",Lexington,North High\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "player_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!selectedFile || !selectedTeam) return;

    setIsImporting(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("team_id", selectedTeam);
    formData.append("organization_id", organizationId);

    try {
      const response = await fetch("/api/import/players", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import players.");
      }

      onImportSuccess();
      onClose();
      setSelectedFile(null);
      setSelectedTeam("");
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Import Players</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              ✕
            </button>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const files = e.target.files;
                  setSelectedFile(files && files.length > 0 ? files[0] : null);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">Need a template? Download our CSV template with sample data.</p>
              <button type="button" onClick={handleDownloadTemplate} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Download Template →
              </button>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || !selectedTeam || isImporting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? "Importing..." : "Import Players"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export function PlayerManager({ initialPlayers, teams, organizationId }: PlayerManagerProps) {
  const [players, setPlayers] = useState<PlayerWithTeam[]>(initialPlayers);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");
  const [teamFilter, setTeamFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithTeam | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);

  const supabase = createClient();

  // Keep your existing fetchPlayers function
  const fetchPlayers = useCallback(async () => {
    const { data, error } = await supabase.from("players").select(`*, teams ( name )`).eq("organization_id", organizationId);

    if (error) {
      console.error("Error fetching players:", error);
      return;
    }
    setPlayers(data as PlayerWithTeam[]);
  }, [supabase, organizationId]);

  // Keep your existing handleSaveSuccess function
  const handleSaveSuccess = (savedPlayer: Player, isNew: boolean) => {
    const team = teams.find((t) => t.id === savedPlayer.team_id);

    const playerWithTeam = {
      ...savedPlayer,
      teams: team ? { name: team.name } : null,
    };

    if (isNew) {
      setPlayers((prev) => [...prev, playerWithTeam]);
    } else {
      setPlayers((prev) => prev.map((p) => (p.id === savedPlayer.id ? playerWithTeam : p)));
    }
    setEditingPlayer(null);
    setShowPlayerForm(false);
  };

  // Keep your existing handleDeleteSuccess function
  const handleDeleteSuccess = (deletedPlayerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== deletedPlayerId));
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.jersey_number?.toString().includes(searchTerm);

      const matchesStatus = player.status === statusFilter;
      const matchesTeam = !teamFilter || player.team_id === teamFilter;
      const matchesPosition = !positionFilter || player.position?.toLowerCase().includes(positionFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesTeam && matchesPosition;
    });
  }, [players, searchTerm, statusFilter, teamFilter, positionFilter]);

  const handleViewDetails = (player: PlayerWithTeam) => {
    setSelectedPlayer(player);
    setShowDetailModal(true);
  };

  const handleEdit = (player: PlayerWithTeam) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handleDelete = async (player: Player) => {
    // Add confirmation dialog
    if (window.confirm(`Are you sure you want to permanently delete ${player.first_name} ${player.last_name}? This cannot be undone.`)) {
      try {
        // Import your deletePlayer action at the top of the file
        // import { deletePlayer } from "../actions";

        // Call your existing deletePlayer action
        const result = await deletePlayer(player.id);

        if (result.error) {
          console.error("Delete failed:", result.error);
          // You might want to show a toast notification here
        } else {
          // THIS IS WHERE YOU USE handleDeleteSuccess
          handleDeleteSuccess(player.id);
          console.log("Player deleted successfully");
          // You might want to show a success toast here
        }
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  // Similarly, for handleArchive, you should integrate it with your updatePlayerStatus action:
  const handleArchive = async (player: Player) => {
    try {
      // Import your updatePlayerStatus action at the top of the file
      // import { updatePlayerStatus } from "../actions";

      const formData = new FormData();
      formData.append("playerId", player.id);
      formData.append("status", player.status === "active" ? "archived" : "active");

      const result = await updatePlayerStatus(formData);

      if (result.error) {
        console.error("Archive failed:", result.error);
      } else {
        // Update the player in local state
        setPlayers((prev) =>
          prev.map((p) => (p.id === player.id ? { ...p, status: player.status === "active" ? "archived" : ("active" as const) } : p))
        );
        console.log("Player status updated successfully");
      }
    } catch (error) {
      console.error("Error updating player status:", error);
    }
  };

  const activeCount = players.filter((p) => p.status === "active").length;
  const alumniCount = players.filter((p) => p.status === "archived").length;

  // If showing player form, render that instead
  if (showPlayerForm) {
    return (
      <PlayerForm
        teams={teams}
        playerToEdit={editingPlayer}
        onSaveSuccess={handleSaveSuccess}
        onCancelEdit={() => {
          setShowPlayerForm(false);
          setEditingPlayer(null);
        }}
        organizationId={organizationId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Players</h1>
              <p className="text-sm text-gray-500">
                {activeCount} active • {alumniCount} alumni
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCSVModal(true)}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Import CSV</span>
              </button>
              <button
                onClick={() => setShowPlayerForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Player</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search players by name or jersey number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Status Filter Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === "active" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("archived")}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === "archived" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Alumni
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "cards" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Teams</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Filter by position..."
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  onClick={() => {
                    setTeamFilter("");
                    setPositionFilter("");
                    setSearchTerm("");
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredPlayers.length} of {players.length} players
          </p>
        </div>

        {/* Player Grid/List */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCompact={false}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCompact={true}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <PlayerDetailModal player={selectedPlayer} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        teams={teams}
        organizationId={organizationId}
        onImportSuccess={fetchPlayers}
      />

      {/* Mobile FAB */}
      <button
        onClick={() => setShowPlayerForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center md:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
