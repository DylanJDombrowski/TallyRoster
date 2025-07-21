// examples/new-structure-usage.tsx - Example showing improved imports and usage
"use client";

// ✅ New structure - Clean, organized imports
import { upsertTeam, deleteTeam } from "@/lib/actions";
import { TeamFormSchema } from "@/lib/schemas";
import { type TeamFormData, type TeamWithDetails } from "@/lib/types";
import { getTeamImageUrl } from "@/lib/utils/images";
import { APP_CONFIG } from "@/lib/config";

// Compare with old structure imports:
// ❌ Old structure - Scattered, hard to find
// import { upsertTeam } from "@/app/dashboard/admin/teams/actions";
// import { TeamFormSchema, type TeamFormData } from "@/lib/types";
// import { getTeamImageUrl } from "@/lib/types"; // Mixed with types

/**
 * Example component showing improved developer experience
 */
export function TeamManagerExample({ teams }: { teams: TeamWithDetails[] }) {
  const handleTeamSubmit = async (formData: FormData) => {
    // ✅ Standardized error handling and return types
    const result = await upsertTeam(formData);
    
    if (result.success) {
      console.log("Team saved:", result.data.team);
      // Optional success message available
      if (result.message) {
        console.log(result.message);
      }
    } else {
      console.error("Error:", result.error);
      // Structured validation errors available
      if (result.details) {
        console.log("Validation errors:", result.details);
      }
    }
  };

  const handleTeamDelete = async (teamId: string) => {
    // ✅ Consistent error handling across all actions
    const result = await deleteTeam(teamId);
    
    if (result.success) {
      console.log(result.data.message);
    } else {
      console.error("Delete failed:", result.error);
    }
  };

  return (
    <div>
      <h2>{APP_CONFIG.name} Teams</h2>
      {teams.map((team) => (
        <div key={team.id}>
          <img 
            src={getTeamImageUrl(team.team_image_url)} 
            alt={team.name}
          />
          <h3>{team.name}</h3>
          <p>Players: {team.players.length}</p>
          <p>Coaches: {team.coaches.length}</p>
          <button onClick={() => handleTeamDelete(team.id)}>
            Delete Team
          </button>
        </div>
      ))}
    </div>
  );
}

// ✅ Benefits of new structure:
// 1. Clear separation of concerns
// 2. Consistent error handling
// 3. Standardized return types
// 4. Better developer experience
// 5. Easier to test and maintain
// 6. Type safety improvements
// 7. Cleaner imports