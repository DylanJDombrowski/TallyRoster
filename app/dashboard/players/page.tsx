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
      <p>
        Error loading your organization data. Please ensure you are part of an
        organization.
      </p>
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
    return <p>Error loading team data.</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl text-slate-900 font-bold mb-4">Manage Players</h1>
      {/* 3. Pass all required props, including the new organizationId */}
      <PlayerManager
        initialPlayers={playersData ?? []}
        teams={teamsData ?? []}
        organizationId={organizationId}
      />
    </div>
  );
}
