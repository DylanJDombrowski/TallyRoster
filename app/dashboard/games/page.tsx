import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { GameManager } from "./components/game-manager";

export default async function GamesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userOrgRole } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!userOrgRole || userOrgRole.role !== "admin") {
    return <p>Admin access required</p>;
  }

  const { data: teams } = await supabase.from("teams").select("*").eq("organization_id", userOrgRole.organization_id).order("name");

  const { data: games } = await supabase
    .from("games")
    .select(
      `
      *,
      teams!inner(name)
    `
    )
    .eq("organization_id", userOrgRole.organization_id)
    .order("game_date", { ascending: false });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Game Management</h1>
      <GameManager teams={teams || []} initialGames={games || []} organizationId={userOrgRole.organization_id} />
    </div>
  );
}
