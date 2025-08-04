// app/sites/[subdomain]/forms-and-links/page.tsx - ACCORDION VERSION
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Container } from "@/app/components/Container";
import { AccordionContainer } from "./components/accordion-container";

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
    .select("name, forms_links_nav_label")
    .eq("subdomain", subdomain)
    .single();

  const orgName = organization?.name || "Organization";
  const pageTitle = organization?.forms_links_nav_label || "Forms & Links";

  return {
    title: `${pageTitle} | ${orgName}`,
    description: `Important forms, registration links, and resources for ${orgName}. Find all the information you need in one place.`,
    openGraph: {
      title: `${pageTitle} | ${orgName}`,
      description: `Important forms and resources for ${orgName}`,
    },
  };
}

// Empty state component
function EmptyState({
  organizationName,
  pageTitle,
  primaryColor,
}: {
  organizationName: string;
  pageTitle: string;
  primaryColor: string;
}) {
  return (
    <div className="text-center py-16">
      <div
        className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${primaryColor}20` }}
      >
        <svg
          className="w-12 h-12"
          style={{ color: primaryColor }}
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
        No {pageTitle} Available Yet
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
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (!organization) {
    notFound();
  }

  // Check if forms & links page is enabled
  if (!organization.show_forms_links) {
    notFound();
  }

  // 2. Get the links for that organization, ordered by position
  const { data: links, error } = await supabase
    .from("organization_links")
    .select("*")
    .eq("organization_id", organization.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching organization links:", error);
  }

  const primaryColor = organization.primary_color || "#161659";
  const secondaryColor = organization.secondary_color || "#BD1515";
  const pageTitle = organization.forms_links_nav_label || "Forms & Links";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header with organization branding */}
      <div
        className="py-16 text-white"
        style={{
          backgroundColor: secondaryColor,
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageTitle}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Important information and resources for {organization.name}
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
                  Click on any section below to expand and access forms,
                  registration, and other important resources.
                </p>
              </div>

              <AccordionContainer links={links} primaryColor={primaryColor} />

              {/* Side image like Angular version */}
              <div className="mt-16 flex justify-center">
                <div className="w-full max-w-md">
                  <div
                    className="aspect-square rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="mt-12 text-center">
                <p className="text-sm text-slate-500">
                  Links open in a new tab. If you have trouble accessing any
                  resource, please contact {organization.name} directly.
                </p>
              </div>
            </>
          ) : (
            <EmptyState
              organizationName={organization.name}
              pageTitle={pageTitle}
              primaryColor={primaryColor}
            />
          )}
        </div>
      </Container>
    </main>
  );
}
