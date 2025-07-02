// app/sites/[subdomain]/teams/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { TeamCard } from "@/app/components/TeamCard"; // Assuming TeamCard is in the main components folder

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const cookieStore = await cookies();
  const { subdomain } = await params;
  const supabase = createClient(cookieStore);

  // 1. Find the organization ID from the subdomain
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  // 2. Fetch only the teams that belong to this specific organization
  const { data: teams, error } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", organization.id)
    .order("year", { ascending: false });

  if (error) {
    console.error("Error fetching teams:", error);
    return <p>Error loading teams.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Teams of {organization.name}
      </h1>
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-600">
          No teams have been added yet.
        </p>
      )}
    </div>
  );
}
