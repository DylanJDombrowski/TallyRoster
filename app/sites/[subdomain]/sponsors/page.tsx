import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default async function SponsorsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, sponsors_nav_label")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  // Get sponsors
  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("*")
    .eq("organization_id", organization.id)
    .eq("active", true)
    .order("position", { ascending: true });

  const pageTitle = organization.sponsors_nav_label || "Our Partners";

  return (
    <>
      {/* Sticky Header */}
      <div className="sticky top-[48px] text-left z-40 bg-secondary text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {sponsors && sponsors.length > 0 ? (
          <div className="space-y-12">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-gray-50 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
                  {sponsor.logo_url && (
                    <div className="flex-shrink-0">
                      <Image
                        src={sponsor.logo_url}
                        alt={`${sponsor.name} Logo`}
                        width={160}
                        height={160}
                        className="w-40 h-40 object-contain rounded-lg bg-white p-2"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                      {sponsor.name}
                    </h2>

                    {sponsor.description && (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {sponsor.description}
                      </p>
                    )}

                    {sponsor.website_url && (
                      <a
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Visit {sponsor.name}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No sponsors to display at this time.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
