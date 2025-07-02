import { Team } from "@/lib/types";

interface TeamHeaderProps {
  team: Team;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div className="sticky top-0 z-40 text-white py-4 shadow-md" style={{ backgroundColor: "var(--color-secondary, #BD1515)" }}>
      <div className="max-w-screen-xl mx-auto px-4">
        <h1 className="text-3xl font-bold font-oswald">{team.name}</h1>
      </div>
    </div>
  );
}
