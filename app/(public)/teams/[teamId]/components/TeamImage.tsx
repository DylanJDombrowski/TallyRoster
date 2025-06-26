import { Team } from "@/lib/types";
import Image from "next/image";

interface TeamImageProps {
  team: Team;
}

export function TeamImage({ team }: TeamImageProps) {
  if (!team.team_image_url) return null;

  return (
    <div className="mb-8">
      <div className="relative w-full aspect-[5/2] rounded-lg overflow-hidden shadow-md">
        <Image
          src={team.team_image_url}
          alt={`${team.name} team photo`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority
        />
      </div>
    </div>
  );
}
