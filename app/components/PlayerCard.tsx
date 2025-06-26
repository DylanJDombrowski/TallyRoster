import { Player } from "@/lib/types";
import Image from "next/image";

// Assuming you have a default placeholder image in your public folder
const defaultHeadshot = "/assets/logos/mvxLogo2.png";

export function PlayerCard({ player }: { player: Player }) {
  const headshotUrl = player.headshot_url || defaultHeadshot;

  return (
    <div className="text-center font-oswald border border-slate-200 rounded-lg bg-white shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-1">
      <div className="relative w-full h-56 bg-slate-100">
        <Image src={headshotUrl} alt={`Headshot of ${player.first_name} ${player.last_name}`} fill style={{ objectFit: "cover" }} />
      </div>
      <div className="p-4">
        <p className="text-lg font-semibold text-primary">#{player.jersey_number || "N/A"}</p>
        <h3 className="text-xl font-bold text-slate-900 truncate">
          {player.first_name} {player.last_name}
        </h3>
        <p className="text-md text-slate-600">{player.position || "Player"}</p>
      </div>
    </div>
  );
}
