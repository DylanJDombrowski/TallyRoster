// app/dashboard/players/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionData } from "@/lib/services";
import { PlayerManager } from "./components/player-manager";

export const dynamic = "force-dynamic";

export default async function ManagePlayersPage() {
  // Get session data from the cached function
  const sessionData = await getSessionData();

  // Handle authentication and authorization
  if (!sessionData.user) {
    redirect("/login");
  }

  if (!sessionData.currentOrg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Error</h1>
        <p className="text-red-500">
          No organization found. Please contact support.
        </p>
      </div>
    );
  }

  // Only fetch page-specific data - no need to re-fetch user/org data
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch teams and players scoped to the user's organization
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", sessionData.currentOrg.id)
    .order("name");

  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("*, teams (name)")
    .eq("organization_id", sessionData.currentOrg.id)
    .order("last_name");

  if (teamsError || playersError) {
    console.error("Error fetching teams or players", {
      teamsError,
      playersError,
    });
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Data Error</h1>
        <p className="text-red-500">
          Error loading team data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <PlayerManager
      initialPlayers={playersData ?? []}
      teams={teamsData ?? []}
      organizationId={sessionData.currentOrg.id}
    />
  );
}
