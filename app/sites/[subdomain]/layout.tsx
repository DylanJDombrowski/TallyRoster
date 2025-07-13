// app/sites/[subdomain]/layout.tsx - Enhanced Version
import Navigation from "@/app/components/Navigation";
import { ThemeListener } from "@/app/components/ThemeListener";
import { OrganizationProvider } from "@/context/OrganizationProvider";
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

interface NavLink {
  href: string;
  label: string;
  subLinks?: { href: string; label: string }[];
}

// Enhanced function to fetch organization data with error handling
async function getOrganizationData(subdomain: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log(`Fetching organization data for subdomain: ${subdomain}`);

  const { data: organization, error } = await supabase.from("organizations").select("*").eq("subdomain", subdomain).single();

  if (error) {
    console.error(`Error fetching organization for subdomain ${subdomain}:`, error);
    return { organization: null, teams: [] };
  }

  if (!organization) {
    console.log(`No organization found for subdomain: ${subdomain}`);
    return { organization: null, teams: [] };
  }

  console.log(`Found organization: ${organization.name} (ID: ${organization.id})`);

  // Fetch teams for this organization
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", organization.id)
    .order("name", { ascending: true });

  if (teamsError) {
    console.error("Error fetching teams:", teamsError);
  }

  return {
    organization: organization as Organization,
    teams: (teams as Team[]) || [],
  };
}

// Enhanced theme style component
function DynamicThemeStyles({ organization }: { organization: Organization }) {
  const primaryColor = organization.primary_color || "#161659";
  const secondaryColor = organization.secondary_color || "#BD1515";

  return (
    <>
      <style jsx global>{`
        :root {
          --color-primary: ${primaryColor};
          --color-secondary: ${secondaryColor};
          --color-primary-foreground: #ffffff;
          --organization-name: "${organization.name}";
        }

        /* Ensure primary color is applied to key elements */
        .bg-primary {
          background-color: ${primaryColor} !important;
        }

        .text-primary {
          color: ${primaryColor} !important;
        }

        .border-primary {
          border-color: ${primaryColor} !important;
        }

        .bg-secondary {
          background-color: ${secondaryColor} !important;
        }

        .text-secondary {
          color: ${secondaryColor} !important;
        }

        .border-secondary {
          border-color: ${secondaryColor} !important;
        }
      `}</style>
    </>
  );
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const { organization, teams } = await getOrganizationData(subdomain);

  if (!organization) {
    console.log(`Organization not found for subdomain: ${subdomain}, returning 404`);
    notFound();
  }

  // Define the navigation links for this organization
  const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    {
      href: "/teams",
      label: "Teams",
      subLinks: teams.map((team) => ({
        href: `/teams/${team.id}`,
        label: team.name,
      })),
    },
    { href: "/alumni", label: "Alumni" },
    { href: "/on-the-field", label: "On The Field" },
    { href: "/forms-and-links", label: "Forms & Resources" },
    { href: "/all-aboard", label: "All Aboard" },
    { href: "/extended-team", label: "Our Extended Team" },
    { href: "/xpress-social", label: "Xpress Social" },
  ];

  return (
    <OrganizationProvider organization={organization}>
      <div className="flex flex-col min-h-screen">
        {/* Dynamic theme styles */}
        <DynamicThemeStyles organization={organization} />

        {/* Theme listener for live updates */}
        <ThemeListener />

        {/* Header */}
        <header className="font-oswald bg-white shadow-sm">
          {/* Top ribbon with secondary color */}
          <div className="py-1 px-4 text-white text-center" style={{ backgroundColor: organization.secondary_color || "#b70f0f" }}>
            <div className="text-sm">Welcome to {organization.name}</div>
          </div>

          {/* Logo and organization name */}
          <div className="container mx-auto py-4 px-4">
            <div className="flex items-center justify-center">
              {organization.logo_url ? (
                <div className="h-16 md:h-24 w-auto mr-4 relative">
                  <Image
                    src={organization.logo_url}
                    alt={`${organization.name} Logo`}
                    width={96}
                    height={96}
                    className="h-full w-auto object-contain"
                    priority
                  />
                </div>
              ) : (
                <div
                  className="h-16 md:h-24 w-16 md:w-24 mr-4 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{
                    backgroundColor: organization.primary_color || "#161659",
                  }}
                >
                  {organization.name?.charAt(0) || "O"}
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-5xl uppercase font-medium" style={{ color: organization.primary_color || "#161659" }}>
                  {organization.name}
                </h1>
                <p className="text-sm md:text-2xl uppercase hidden md:block" style={{ color: organization.secondary_color || "#b70f0f" }}>
                  Excellence in Sports
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation teams={teams} navLinks={navLinks} />

        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="font-oswald text-white py-10 px-5" style={{ backgroundColor: organization.secondary_color || "#b70f0f" }}>
          <div className="max-w-screen-xl mx-auto text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{organization.name}</h2>
              <p className="opacity-90">Excellence in Sports</p>
            </div>

            <div className="border-t border-white/20 pt-6">
              <p className="text-sm">
                © {new Date().getFullYear()} {organization.name}. All Rights Reserved.
              </p>
              {organization.subdomain && <p className="text-xs opacity-75 mt-1">Powered by TallyRoster</p>}
            </div>
          </div>
        </footer>
      </div>
    </OrganizationProvider>
  );
}
