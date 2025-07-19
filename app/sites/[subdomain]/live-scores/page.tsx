import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { LiveScoreboard } from "./components/live-scoreboard";

export default async function LiveScoresPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: organization } = await supabase.from("organizations").select("id, name").eq("subdomain", subdomain).single();

  if (!organization) return null;

  const { data: games } = await supabase
    .from("games")
    .select(
      `
      *,
      teams!inner(name)
    `
    )
    .eq("organization_id", organization.id)
    .in("status", ["live", "scheduled"])
    .order("game_date", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Scores</h1>
      <LiveScoreboard games={games || []} />
    </div>
  );
}
