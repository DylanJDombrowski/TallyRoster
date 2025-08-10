// app/dashboard/admin/teams/components/team-manager.tsx
"use client";

import { Team } from "@/lib/types";
import { getTeamWithCoach } from "@/lib/actions/teams";
import { useCallback, useState } from "react";
import { TeamForm } from "./team-form";
import { TeamList } from "./team-list";

interface TeamManagerProps {
  initialTeams: Team[];
}

// Extended team type to include coach data
interface TeamWithCoach extends Team {
  coaches?: Array<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
  }>;
}

export function TeamManager({ initialTeams }: TeamManagerProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // NEW: State for coach data when editing
  const [coachData, setCoachData] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [loadingCoachData, setLoadingCoachData] = useState(false);

  const handleSaveSuccess = useCallback((savedTeam: Team, isNew: boolean) => {
    if (isNew) {
      setTeams((prevTeams) => [...prevTeams, savedTeam]);
    } else {
      setTeams((prevTeams) =>
        prevTeams.map((t) => (t.id === savedTeam.id ? savedTeam : t))
      );
    }
    setEditingTeam(null);
    setCoachData({});
    setIsFormVisible(false);
  }, []);

  const handleDeleteSuccess = useCallback((deletedTeamId: string) => {
    setTeams((prevTeams) => prevTeams.filter((t) => t.id !== deletedTeamId));
  }, []);

  // NEW: Enhanced edit handler that loads coach data
  const handleEdit = async (team: Team) => {
    setEditingTeam(team);
    setIsFormVisible(true);
    setLoadingCoachData(true);
    setCoachData({});

    try {
      // Fetch team with coach data
      const result = await getTeamWithCoach(team.id);

      if (result.error) {
        console.error("Error loading coach data:", result.error);
        // Continue with edit even if coach data fails to load
      } else if (result.team) {
        const teamWithCoach = result.team as TeamWithCoach;

        // Extract coach data if available
        if (teamWithCoach.coaches && teamWithCoach.coaches.length > 0) {
          const primaryCoach = teamWithCoach.coaches[0]; // Get the first/primary coach
          setCoachData({
            name: primaryCoach.name,
            email: primaryCoach.email || "",
            phone: primaryCoach.phone || "",
          });

          console.log(
            `[Team Manager] Loaded coach data for team ${team.name}:`,
            {
              name: primaryCoach.name,
              email: primaryCoach.email,
              hasPhone: !!primaryCoach.phone,
            }
          );
        } else {
          console.log(`[Team Manager] No coach found for team ${team.name}`);
          setCoachData({});
        }
      }
    } catch (error) {
      console.error("Error fetching team with coach:", error);
      // Continue with edit even if coach data fails to load
      setCoachData({});
    } finally {
      setLoadingCoachData(false);
    }
  };

  const handleCancel = () => {
    setEditingTeam(null);
    setCoachData({});
    setIsFormVisible(false);
  };

  const handleAddNew = () => {
    setEditingTeam(null);
    setCoachData({});
    setIsFormVisible(true);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Form Column */}
      <div
        className={`lg:col-span-1 ${
          isFormVisible ? "block" : "hidden"
        } lg:block`}
      >
        {loadingCoachData && editingTeam ? (
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-3" />
              <span className="text-slate-600">
                Loading coach information...
              </span>
            </div>
          </div>
        ) : (
          <TeamForm
            teamToEdit={editingTeam}
            onSaveSuccess={handleSaveSuccess}
            onCancelEdit={handleCancel}
            existingTeams={teams}
            initialCoachData={coachData} // NEW: Pass coach data to form
          />
        )}
      </div>

      {/* List Column */}
      <div className="lg:col-span-2">
        {/* Mobile-only button to show the form */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => {
              if (isFormVisible) {
                handleCancel();
              } else {
                handleAddNew();
              }
            }}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {isFormVisible ? "Close Form" : "Add New Team"}
          </button>
        </div>

        {/* Desktop add button */}
        <div className="hidden lg:block mb-6">
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add New Team
          </button>
        </div>

        <TeamList
          teams={teams}
          onEdit={handleEdit}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
}
