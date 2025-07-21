// app/dashboard/players/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PlayerManager } from "./components/player-manager";

export const dynamic = "force-dynamic";

export default async function ManagePlayersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // 1. Fetch the user's organization ID first. This is crucial for multi-tenancy.
  const { data: orgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("organization_id")
    .eq("user_id", session.user.id)
    .single();

  if (roleError || !orgRole) {
    console.error("Error fetching user organization:", roleError);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h1>
          <p className="text-gray-600">Error loading your organization data. Please ensure you are part of an organization.</p>
        </div>
      </div>
    );
  }

  const organizationId = orgRole.organization_id;

  // 2. Fetch teams and players scoped to the user's organization.
  // Your RLS policies will also enforce this, but filtering here is best practice.
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("*, teams (name)")
    .eq("organization_id", organizationId)
    .order("last_name");

  if (teamsError || playersError) {
    console.error("Error fetching teams or players", {
      teamsError,
      playersError,
    });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Error</h1>
          <p className="text-gray-600">Error loading team data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return <PlayerManager initialPlayers={playersData ?? []} teams={teamsData ?? []} organizationId={organizationId} />;
}
