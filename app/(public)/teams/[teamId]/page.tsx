// app/(public)/teams/[teamId]/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Container } from "../../components/Container";
import { CoachCard } from "./components/CoachCard";
import { PlayerCard } from "./components/PlayerCard";
import { ScheduleTable } from "./components/ScheduleTable";
import { TeamHeader } from "./components/TeamHeader";
import { TeamImage } from "./components/TeamImage";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params; // Await params in Next.js 15
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Fetch team with all related data
  const { data: team } = await supabase.from("teams").select("*").eq("id", teamId).single();

  if (!team) {
    notFound();
  }

  // Fetch players for this team
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .eq("status", "active")
    .order("jersey_number", { ascending: true });

  // Fetch coaches for this team
  const { data: coaches } = await supabase.from("coaches").select("*").eq("team_id", teamId).order("order_index", { ascending: true });

  // Fetch schedule events for this team
  const { data: scheduleEvents } = await supabase
    .from("schedule_events")
    .select("*")
    .eq("team_id", teamId)
    .order("event_date", { ascending: true });

  return (
    <div className="min-h-screen">
      {/* Sticky Team Header */}
      <TeamHeader team={team} />

      <Container className="py-8">
        {/* Team Image */}
        {team.team_image_url && <TeamImage team={team} />}

        {/* Roster Section */}
        <section id="roster" className="mb-16">
          <h2
            className="text-3xl font-semibold mb-6 border-l-4 pl-4 font-oswald"
            style={{
              color: "var(--color-primary, #161659)",
              borderColor: "var(--color-secondary, #BD1515)",
            }}
          >
            Roster
          </h2>
          {players && players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} teamId={teamId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">No active players found for this team.</p>
            </div>
          )}
        </section>

        {/* Schedule Section */}
        <section id="schedule" className="mb-16">
          <h2 className="text-3xl font-semibold mb-6 font-oswald" style={{ color: "var(--color-primary, #161659)" }}>
            {team.year || new Date().getFullYear()} Schedule
          </h2>
          {scheduleEvents && scheduleEvents.length > 0 ? (
            <ScheduleTable events={scheduleEvents} />
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">No scheduled events found for this team.</p>
            </div>
          )}
        </section>

        {/* Coaches Section */}
        <section id="coaches">
          <h2 className="text-3xl font-semibold mb-6 font-oswald" style={{ color: "var(--color-primary, #161659)" }}>
            Coaches
          </h2>
          {coaches && coaches.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {coaches.map((coach, index) => (
                <CoachCard key={coach.id} coach={coach} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">No coaches found for this team.</p>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TeamPageProps) {
  const { teamId } = await params; // Await params here too
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: team } = await supabase.from("teams").select("name, season").eq("id", teamId).single();

  if (!team) {
    return {
      title: "Team Not Found",
    };
  }

  return {
    title: `${team.name} | Miami Valley Xpress`,
    description: `Meet the ${team.name} roster, schedule, and coaching staff for the ${team.season} season.`,
  };
}
