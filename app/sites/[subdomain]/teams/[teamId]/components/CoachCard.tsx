import { Coach, getCoachImageUrl } from "@/lib/types";
import Image from "next/image";

interface CoachCardProps {
  coach: Coach;
  index: number;
}

export function CoachCard({ coach, index }: CoachCardProps) {
  const imageUrl = getCoachImageUrl(coach);
  const isEven = index % 2 === 0;

  return (
    <div className={`p-4 rounded-lg shadow-md ${isEven ? "bg-white" : "bg-gray-50"}`}>
      <div className="relative w-full h-48 mb-4 rounded overflow-hidden">
        <Image
          src={imageUrl}
          alt={coach.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">{coach.name}</h3>
      <p className="text-gray-600 mb-1">{coach.position}</p>
      {coach.email && (
        <p className="text-sm mb-1">
          <a href={`mailto:${coach.email}`} className="text-blue-600 hover:underline">
            {coach.email}
          </a>
        </p>
      )}
      {coach.phone && (
        <p className="text-sm">
          <a href={`tel:${coach.phone}`} className="text-blue-600 hover:underline">
            {coach.phone}
          </a>
        </p>
      )}
    </div>
  );
}
