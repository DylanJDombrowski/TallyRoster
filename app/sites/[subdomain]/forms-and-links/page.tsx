// app/sites/[subdomain]/forms-and-links/page.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Database } from "@/lib/database.types";
import { Container } from "@/app/components/Container";

type OrganizationLink =
  Database["public"]["Tables"]["organization_links"]["Row"];

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("subdomain", subdomain)
    .single();

  const orgName = organization?.name || "Organization";

  return {
    title: `Forms & Resources | ${orgName}`,
    description: `Important forms, registration links, and resources for ${orgName}. Find all the information you need in one place.`,
    openGraph: {
      title: `Forms & Resources | ${orgName}`,
      description: `Important forms and resources for ${orgName}`,
    },
  };
}

// Enhanced link card component with better design
function LinkCard({ link, index }: { link: OrganizationLink; index: number }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-6 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-xl hover:border-blue-400 transition-all duration-300 group transform hover:-translate-y-1"
      // Add some staggered animation delay
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 mb-2">
            {link.title}
          </h3>
          {link.description && (
            <p className="text-slate-600 mb-4 line-clamp-3">
              {link.description}
            </p>
          )}
        </div>

        {/* External link icon */}
        <div className="ml-4 text-slate-400 group-hover:text-blue-600 transition-colors">
          <svg
            className="w-5 h-5"
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
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-blue-600 group-hover:underline">
          Access Link
        </div>
        <div className="text-xs text-slate-400 truncate max-w-[200px]">
          {new URL(link.url).hostname}
        </div>
      </div>
    </a>
  );
}

// Empty state component
function EmptyState({ organizationName }: { organizationName: string }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        No Resources Available Yet
      </h3>
      <p className="text-slate-600 max-w-md mx-auto">
        {organizationName} hasn&apos;t added any forms or resource links yet.
        Check back later for important documents and registration forms.
      </p>
    </div>
  );
}

export default async function FormsAndLinksPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Get the organization by subdomain
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, primary_color, secondary_color")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  // 2. Get the links for that organization, ordered by creation date for now
  // TODO: Order by position once we add the position column
  const { data: links, error } = await supabase
    .from("organization_links")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching organization links:", error);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header with organization branding */}
      <div
        className="py-16 text-white"
        style={{
          backgroundColor: organization.primary_color || "#161659",
          background: `linear-gradient(135deg, ${
            organization.primary_color || "#161659"
          } 0%, ${organization.secondary_color || "#BD1515"} 100%)`,
        }}
      >
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Forms & Resources
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Important links and resources for {organization.name}
            </p>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <Container>
        <div className="py-12">
          {links && links.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <p className="text-lg text-slate-600">
                  Click on any link below to access forms, registration, and
                  other important resources.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map((link, index) => (
                  <LinkCard key={link.id} link={link} index={index} />
                ))}
              </div>

              {/* Footer note */}
              <div className="mt-16 text-center">
                <p className="text-sm text-slate-500">
                  Links open in a new tab. If you have trouble accessing any
                  resource, please contact {organization.name} directly.
                </p>
              </div>
            </>
          ) : (
            <EmptyState organizationName={organization.name} />
          )}
        </div>
      </Container>
    </main>
  );
}
