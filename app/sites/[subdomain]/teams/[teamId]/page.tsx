// app/sites/[subdomain]/teams/[teamId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { TeamHeader } from "./components/TeamHeader";
import { PlayerCard } from "./components/PlayerCard";
import { CoachCard } from "./components/CoachCard";
import { ScheduleTable } from "./components/ScheduleTable";

export default async function TeamIdPage({
  params,
}: {
  params: Promise<{ subdomain: string; teamId: string }>;
}) {
  const cookieStore = await cookies();
  const { subdomain, teamId } = await params;
  const supabase = createClient(cookieStore);

  // 1. Fetch the organization based on the subdomain to get its ID
  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  // 2. Fetch the specific team, ensuring it belongs to the correct organization
  const { data: team, error } = await supabase
    .from("teams")
    .select(
      `
      *,
      players (*),
      coaches (*),
      schedule_events (*)
    `
    )
    .eq("id", teamId)
    .eq("organization_id", organization.id) // Security check
    .single();

  if (error || !team) {
    console.error("Error fetching team details:", error);
    notFound();
  }

  // Sort players and coaches, and provide default empty arrays for safety
  const sortedPlayers =
    team.players?.sort(
      (a, b) => (a.jersey_number || 999) - (b.jersey_number || 999)
    ) || [];
  const sortedCoaches =
    team.coaches?.sort(
      (a, b) => (a.order_index || 999) - (b.order_index || 999)
    ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* THE FIX: Pass the entire team object to the TeamHeader component */}
      <TeamHeader team={team} />

      <section id="roster" className="my-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Roster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} teamId={team.id} />
          ))}
        </div>
      </section>

      <section id="coaches" className="my-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Coaching Staff</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {sortedCoaches.map((coach, index) => (
            <CoachCard key={coach.id} coach={coach} index={index} />
          ))}
        </div>
      </section>

      <section id="schedule" className="my-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Schedule</h2>
        <ScheduleTable events={team.schedule_events || []} />
      </section>
    </div>
  );
}
