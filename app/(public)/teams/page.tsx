// app/(public)/teams/page.tsx
import { Team } from "@/lib/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Container } from "../../components/Container";

export default async function TeamsPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Fetch all teams ordered by name
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 font-oswald"
            style={{ color: "var(--color-primary, #161659)" }}
          >
            Xpress Teams
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Meet our talented teams competing across multiple age groups. Click
            on any team to view their roster, schedule, and coaching staff.
          </p>
        </div>

        {/* Teams Grid */}
        {teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4">
              <svg
                className="mx-auto h-24 w-24 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Teams Available
            </h3>
            <p className="text-slate-600">
              Teams will be displayed here once they are added to the system.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

// Team Card Component
function TeamCard({ team }: { team: Team }) {
  const getTeamImageUrl = (team: Team): string => {
    if (team.team_image_url) return team.team_image_url;
    return "/assets/logos/mvxLogo2.png"; // fallback image
  };

  return (
    <Link href={`/teams/${team.id}`} className="group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Team Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={getTeamImageUrl(team)}
            alt={`${team.name} team photo`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Team Name Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-white text-xl font-bold font-oswald group-hover:text-yellow-300 transition-colors">
              {team.name}
            </h2>
          </div>
        </div>

        {/* Team Details */}
        <div className="p-6">
          <div className="space-y-2">
            {team.season && (
              <p className="text-slate-600">
                <span className="font-medium">Season:</span> {team.season}
              </p>
            )}
            {team.year && (
              <p className="text-slate-600">
                <span className="font-medium">Year:</span> {team.year}
              </p>
            )}
          </div>

          {/* View Team Button */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span
              className="inline-flex items-center text-sm font-medium group-hover:underline transition-colors"
              style={{ color: "var(--color-primary, #161659)" }}
            >
              View Team Details
              <svg
                className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Metadata for SEO
export const metadata = {
  title: "Teams | Miami Valley Xpress",
  description:
    "Discover all Miami Valley Xpress softball teams, their rosters, schedules, and coaching staff across multiple age groups.",
};
