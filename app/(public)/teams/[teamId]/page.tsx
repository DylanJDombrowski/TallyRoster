import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PlayerCard } from "../../components/PlayerCard";

// This interface defines the shape of the props for our page
interface TeamPageProps {
  params: {
    teamId: string;
  };
}

export default async function TeamRosterPage({ params }: TeamPageProps) {
  const { teamId } = params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Fetch the team's details
  const { data: team } = await supabase.from("teams").select("*").eq("id", teamId).single();

  // If no team is found, show the 404 page
  if (!team) {
    notFound();
  }

  // Fetch all active players for this team
  const { data: players } = await supabase.from("players").select("*").eq("team_id", teamId).eq("status", "active").order("jersey_number");

  return (
    <div>
      <section className="text-center py-8 bg-white rounded-lg shadow-md mb-12">
        <h1 className="font-oswald text-4xl font-bold text-primary">{team.name}</h1>
        {team.season && <p className="text-xl text-slate-600 mt-2">{team.season} Season</p>}
      </section>

      {players && players.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-800">The roster for this team has not been posted yet.</p>
      )}
    </div>
  );
}
