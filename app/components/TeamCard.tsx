// app/components/TeamCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Team, getTeamImageUrl } from "@/lib/types"; // Assuming types and helpers are in lib/types.ts

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200"
    >
      <div className="relative h-48 w-full">
        <Image
          src={getTeamImageUrl(team.team_image_url)}
          alt={`Image of the ${team.name} team`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            {team.name}
          </h2>
        </div>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex justify-between items-center">
          {team.season && (
            <p className="text-sm font-semibold text-slate-600">
              {team.season} Season
            </p>
          )}
          <div
            className="px-4 py-2 text-sm font-semibold text-white rounded-full"
            style={{ backgroundColor: "var(--color-primary, #161659)" }}
          >
            View Team
          </div>
        </div>
      </div>
    </Link>
  );
}
