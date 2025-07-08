// app/dashboard/admin/teams/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TeamManager } from "./components/team-manager";

export const dynamic = "force-dynamic";

export default async function ManageTeamsPage() {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // FIXED: Use user_organization_roles instead of user_roles
  const { data: userOrgRole, error: roleError } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (roleError || !userOrgRole) {
    console.error("Error fetching user organization:", roleError);
    return <p className="p-8">Error loading your organization data.</p>;
  }

  // Check if user is admin
  if (userOrgRole.role !== "admin") {
    return <p className="p-8">You do not have permission to view this page.</p>;
  }

  // FIXED: Only fetch teams from user's organization
  const { data: teams } = await supabase.from("teams").select("*").eq("organization_id", userOrgRole.organization_id).order("name");

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Manage Teams</h1>
      <TeamManager initialTeams={teams ?? []} />
    </div>
  );
}
