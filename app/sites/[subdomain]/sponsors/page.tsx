// app/sites/[subdomain]/sponsors/page.tsx - NEW SPONSORS PAGE
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";

interface Partner {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  partner_type: string;
  display_order: number;
  active: boolean;
}

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SponsorsPage({ params }: PageProps) {
  const { subdomain } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get organization data
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (orgError || !organization) {
    notFound();
  }

  // Check if sponsors page is enabled
  if (!organization.show_sponsors) {
    notFound();
  }

  // Get partners/sponsors data
  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  const activePartners = partners || [];

  // Get page title from organization settings
  const pageTitle = organization.sponsors_nav_label || "Sponsors";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-40 text-white py-6 shadow-md"
        style={{ backgroundColor: organization.secondary_color || "#BD1515" }}
      >
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">{pageTitle}</h1>
          <p className="mt-2 text-lg opacity-90">
            Thank you to our amazing partners and supporters
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {activePartners.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: organization.primary_color || "#161659",
              }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Partner With Us
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We&apos;re always looking for amazing partners to join our
              journey. Contact us to learn about sponsorship opportunities.
            </p>
          </div>
        ) : (
          // Partners grid
          <div className="space-y-12">
            {activePartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                primaryColor={organization.primary_color || "#161659"}
                secondaryColor={organization.secondary_color || "#BD1515"}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div
          className="mt-16 rounded-lg p-8 text-white text-center"
          style={{ backgroundColor: organization.primary_color || "#161659" }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Interested in Partnering With Us?
          </h2>
          <p className="mb-6 text-lg opacity-90">
            Join our amazing community of supporters and help us continue our
            mission.
          </p>
          <div className="space-y-3">
            <p className="text-sm">
              Contact us to learn more about sponsorship opportunities
            </p>
            {/* Add contact info or link to forms page if available */}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PartnerCardProps {
  partner: Partner;
  primaryColor: string;
  secondaryColor: string;
}

function PartnerCard({
  partner,
  primaryColor,
  secondaryColor,
}: PartnerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        {/* Logo Section */}
        <div className="md:w-1/3 p-8 flex items-center justify-center bg-gray-50">
          {partner.logo_url ? (
            <div className="relative w-40 h-40">
              <Image
                src={partner.logo_url}
                alt={`${partner.name} Logo`}
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
          ) : (
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {partner.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="md:w-2/3 p-8">
          <h3
            className="text-2xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            {partner.name}
          </h3>

          {partner.description && (
            <p className="text-gray-700 mb-6 leading-relaxed">
              {partner.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span
                className="inline-block px-3 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: secondaryColor }}
              >
                {partner.partner_type === "sponsor" ? "Sponsor" : "Partner"}
              </span>
            </div>

            {partner.website_url && (
              <a
                href={partner.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200"
                style={{ backgroundColor: primaryColor }}
              >
                Visit Website
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { subdomain } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: organization } = await supabase
    .from("organizations")
    .select("name, sponsors_nav_label")
    .eq("subdomain", subdomain)
    .single();

  const pageTitle = organization?.sponsors_nav_label || "Sponsors";
  const orgName = organization?.name || "Organization";

  return {
    title: `${pageTitle} | ${orgName}`,
    description: `Meet our amazing partners and sponsors who support ${orgName}.`,
  };
}
