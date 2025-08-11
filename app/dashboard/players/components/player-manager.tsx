// app/dashboard/players/components/player-manager.tsx - Refactored
"use client";

import { Player, Team } from "@/lib/types";
import { getPlayerImageUrl } from "@/lib/utils/images";
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
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Image from "next/image";
import { PlayerForm } from "./player-form";
import { PlayerDetailModal } from "./player-detail-modal";
import { CSVImportModal } from "./csv-import-modal";
import { usePlayerManagement } from "@/lib/hooks/use-player-management";

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

const PlayerCard = ({
  player,
  isCompact,
  onEdit,
  onArchive,
  onDelete,
  onViewDetails,
}: PlayerCardProps) => {
  if (isCompact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={getPlayerImageUrl(player.headshot_url)}
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
            <button
              onClick={() => onViewDetails(player)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(player)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
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
              src={getPlayerImageUrl(player.headshot_url)}
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
              <p className="text-sm text-blue-600 font-medium">
                {player.teams?.name}
              </p>
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

export function PlayerManager({
  initialPlayers,
  teams,
  organizationId,
}: PlayerManagerProps) {
  const {
    // State
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
    editingPlayer,

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
  } = usePlayerManagement({
    initialPlayers,
    teams,
    organizationId,
  });

  // If showing player form, render that instead
  if (showPlayerForm) {
    return (
      <PlayerForm
        teams={teams}
        playerToEdit={editingPlayer}
        onSaveSuccess={handleSaveSuccess}
        onCancelEdit={handleClosePlayerForm}
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
                    statusFilter === "active"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("archived")}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === "archived"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
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
                    viewMode === "cards"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
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
                  onClick={handleClearFilters}
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
            Showing {filteredPlayers.length} of {filteredPlayers.length} players
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No players found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <PlayerDetailModal
        player={selectedPlayer}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
      />

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={handleCloseCSVModal}
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
