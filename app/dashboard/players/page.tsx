// app/dashboard/players/page.tsx
import { createClient } from "@/lib/supabase/server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PlayerManager } from "./components/player-manager";

export const dynamic = "force-dynamic";

export default async function ManagePlayersPage() {
  const cookieStore = cookies(); // NEW WAY
  const supabase = createClient(await cookieStore); // NEW WAY
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // We still fetch the initial data here on the server
  const { data: teams } = await supabase.from("teams").select("*").order("name");
  const { data: players } = await supabase.from("players").select("*, teams (name)").order("last_name");

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl text-slate-900 font-bold mb-4">Manage Players</h1>
      {/* The manager component handles all the client-side logic */}
      <PlayerManager initialPlayers={players ?? []} teams={teams ?? []} />
    </div>
  );
}
