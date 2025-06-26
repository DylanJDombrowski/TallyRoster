import { Player, getPlayerImageUrl } from "@/lib/types";
import Image from "next/image";

interface PlayerCardProps {
  player: Player;
  teamId: string;
}

// Image positioning logic similar to Angular version
const getPlayerImageStyle = (teamId: string, playerNumber: string): React.CSSProperties => {
  const key = `${teamId}-${playerNumber}`;
  const adjustments: { [key: string]: React.CSSProperties } = {
    // Add specific adjustments as needed
    // Example: '2015-8': { objectPosition: '50% 40%' },
  };

  return adjustments[key] || { objectPosition: "50% 50%" };
};

export function PlayerCard({ player, teamId }: PlayerCardProps) {
  const imageUrl = getPlayerImageUrl(player);
  const imageStyle = getPlayerImageStyle(teamId, player.jersey_number?.toString() || "");

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-70 overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${player.first_name} ${player.last_name}`}
          fill
          className="object-cover"
          style={imageStyle}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Graduation Year Badge */}
        {player.grad_year && (
          <div
            className="absolute top-2 left-2 text-white rounded-md px-2 py-1 text-sm font-bold"
            style={{ backgroundColor: "var(--color-primary, #161659)" }}
          >
            {player.grad_year}
          </div>
        )}

        {/* Player Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
          <h3 className="text-xl font-semibold">
            {player.first_name} {player.last_name}
          </h3>
        </div>

        {/* Jersey Number */}
        <div
          className="absolute bottom-2 right-2 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold z-10"
          style={{ backgroundColor: "var(--color-primary, #161659)" }}
        >
          #{player.jersey_number || "N/A"}
        </div>
      </div>

      {/* Player Details */}
      <div className="p-4">
        <div className="space-y-2">
          {player.position && <p className="bg-gray-100 p-2 rounded">Position: {player.position}</p>}
          {player.height && <p className="bg-gray-100 p-2 rounded">Height: {player.height}</p>}
          {(player.bats || player.throws) && (
            <p className="bg-gray-200 p-2 rounded">
              Bats/Throws: {player.bats || "N/A"}/{player.throws || "N/A"}
            </p>
          )}
          {player.town && <p className="bg-gray-100 p-2 rounded">Town: {player.town}</p>}
          {player.school && <p className="bg-gray-200 p-2 rounded">School: {player.school}</p>}
          {player.gpa && <p className="bg-gray-100 p-2 rounded">GPA: {player.gpa}</p>}
        </div>

        {/* Social Links */}
        {player.twitter_handle && (
          <div className="mt-4 flex justify-center">
            <a
              href={`https://twitter.com/${player.twitter_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center hover:bg-blue-500 text-white rounded-full w-10 h-10 transition-colors duration-300"
              style={{ backgroundColor: "var(--color-secondary, #BD1515)" }}
              title="Twitter Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
