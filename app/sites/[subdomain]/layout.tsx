// app/sites/[subdomain]/layout.tsx
import Navigation from "@/app/components/Navigation";
import { ThemeStyle } from "@/app/components/theme-style";
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

async function getOrganizationData(subdomain: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch all necessary fields from the organization
  const { data: organization, error } = await supabase.from("organizations").select("*").eq("subdomain", subdomain).single();

  if (error || !organization) {
    console.error(`Error or no organization for subdomain ${subdomain}:`, error);
    return { organization: null, teams: [] };
  }

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

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const { organization, teams } = await getOrganizationData(subdomain);

  if (!organization) {
    notFound();
  }

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
  ];

  return (
    // UPDATED: Apply dark class to the html element based on theme
    <html lang="en" className={organization.theme === "dark" ? "dark" : ""}>
      <body className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <OrganizationProvider organization={organization}>
          <ThemeStyle
            primaryColor={organization.primary_color || "#161659"}
            secondaryColor={organization.secondary_color || "#BD1515"}
            primaryFgColor={"#ffffff"}
            organizationName={organization.name}
          />
          <ThemeListener />
          <div className="flex flex-col min-h-screen">
            <header className="font-oswald bg-white dark:bg-gray-800 shadow-sm">
              <div className="py-1 px-4 text-white text-center" style={{ backgroundColor: "var(--color-secondary)" }}>
                <div className="text-sm">Welcome to {organization.name}</div>
              </div>
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
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {organization.name?.charAt(0) || "O"}
                    </div>
                  )}
                  <div className="text-center md:text-left">
                    <h1
                      className="text-2xl md:text-5xl uppercase font-medium text-gray-800 dark:text-gray-100"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {organization.name}
                    </h1>
                    {/* UPDATED: Display the slogan from the database */}
                    <p className="text-sm md:text-2xl uppercase hidden md:block" style={{ color: "var(--color-secondary)" }}>
                      {organization.slogan || "Excellence in Sports"}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <Navigation teams={teams} navLinks={navLinks} />
            <main className="flex-grow">{children}</main>

            <footer className="font-oswald text-white py-10 px-5" style={{ backgroundColor: "var(--color-secondary)" }}>
              <div className="max-w-screen-xl mx-auto text-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{organization.name}</h2>
                  <p className="opacity-90">{organization.slogan || "Excellence in Sports"}</p>
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
      </body>
    </html>
  );
}
