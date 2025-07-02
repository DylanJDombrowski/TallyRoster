// app/sites/[subdomain]/alumni/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPlayerImageUrl } from "@/lib/types"; // Assuming this helper exists

export default async function AlumniPage({
  params,
}: {
  params: { subdomain: string };
}) {
  // THE DEFINITIVE FIX: The cookies() function is synchronous and should not be awaited.
  // This resolves the type error with the PageProps.
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Find the organization ID from the subdomain
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("subdomain", params.subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  // 2. Fetch only the alumni that belong to this specific organization
  // NOTE: This assumes you have added an `organization_id` column to your `alumni` table.
  const { data: alumni, error } = await supabase
    .from("alumni")
    .select("*")
    .eq("organization_id", organization.id)
    .order("grad_year", { ascending: false })
    .order("player_name", { ascending: true });

  if (error) {
    console.error("Error fetching alumni:", error);
    return <p>Error loading alumni data.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900">
          {organization.name} Alumni
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Celebrating our players who have gone on to the next level.
        </p>
      </div>

      {alumni && alumni.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {alumni.map((alum) => (
            <div
              key={alum.id}
              className="bg-white rounded-lg shadow-md overflow-hidden text-center"
            >
              <div className="relative h-40 w-full bg-slate-200">
                <Image
                  src={getPlayerImageUrl(alum.image_url)}
                  alt={`Photo of ${alum.player_name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {alum.player_name}
                </h3>
                <p className="text-sm text-slate-600">
                  Class of {alum.grad_year}
                </p>
                {alum.college && (
                  <p className="mt-2 text-sm font-semibold text-blue-600">
                    {alum.college}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500">
          No alumni records have been added for this organization yet.
        </p>
      )}
    </div>
  );
}
