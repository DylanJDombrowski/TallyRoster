// app/dashboard/admin/teams/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionData } from "@/lib/actions";
import { TeamManager } from "./components/team-manager";

export const dynamic = "force-dynamic";

export default async function ManageTeamsPage() {
  // Get session data from the cached function
  const sessionData = await getSessionData();

  // Handle authentication and authorization
  if (!sessionData.user) {
    redirect("/login");
  }

  if (!sessionData.currentOrg || sessionData.currentRole !== "admin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-red-500">Admin access required to manage teams.</p>
      </div>
    );
  }

  // Only fetch page-specific data (teams) - no need to re-fetch user/org data
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", sessionData.currentOrg.id)
    .order("name");

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Manage Teams</h1>
      <TeamManager initialTeams={teams ?? []} />
    </div>
  );
}
