// app/dashboard/admin/teams/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TeamManager } from "./components/team-manager";

export const dynamic = "force-dynamic";

export default async function ManageTeamsPage() {
  const cookieStore = cookies(); // NEW WAY
  const supabase = createClient(await cookieStore); // NEW WAY
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();

  if (userRole?.role !== "admin") {
    return <p className="p-8">You do not have permission to view this page.</p>;
  }

  const { data: teams } = await supabase.from("teams").select("*").order("name");

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Manage Teams</h1>
      <TeamManager initialTeams={teams ?? []} />
    </div>
  );
}
