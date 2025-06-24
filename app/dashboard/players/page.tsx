// app/dashboard/players/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PlayerForm } from "./components/player-form";
import { PlayerList } from "./components/player-list";
import { Team } from "@/lib/types";

// This ensures the page is always re-rendered to get the latest data
export const dynamic = "force-dynamic";

export default async function ManagePlayersPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch teams for the form's dropdown selector
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("name");

  // Fetch players the current user is allowed to see (thanks to RLS)
  const { data: players } = await supabase
    .from("players")
    .select("*, teams (name)") // Also fetches the team name
    .order("last_name");

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Players</h1>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <PlayerForm teams={teams as Team[]} />
        </div>
        <div className="md:col-span-2">
          <PlayerList players={players ?? []} />
        </div>
      </div>
    </div>
  );
}
