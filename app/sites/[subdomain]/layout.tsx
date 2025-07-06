// app/sites/[subdomain]/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Database } from "@/lib/database.types";
import Navigation from "@/app/components/Navigation";
import { ThemeListener } from "@/app/components/ThemeListener";
import { OrganizationProvider } from "@/context/OrganizationProvider";
import Image from "next/image";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

interface NavLink {
  href: string;
  label: string;
  subLinks?: { href: string; label: string }[];
}

// Fetch organization-specific data on the server
async function getOrganizationData(subdomain: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (error || !organization) {
    return { organization: null, teams: [] };
  }

  // Fetch teams for this organization, ordered by name
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", organization.id)
    .order("name", { ascending: true });

  return {
    organization: organization as Organization,
    teams: (teams as Team[]) || [],
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const { organization, teams } = await getOrganizationData(subdomain);

  if (!organization) {
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
      <div
        className="flex flex-col min-h-screen"
        style={
          {
            "--color-primary": organization.primary_color || "#161659",
            "--color-secondary": organization.secondary_color || "#BD1515",
          } as React.CSSProperties
        }
      >
        <ThemeListener />

        {/* Simple Header */}
        <header className="font-oswald bg-white shadow-sm">
          {/* Top ribbon */}
          <div
            className="py-1 px-4 text-white text-center"
            style={{ backgroundColor: "var(--color-secondary, #b70f0f)" }}
          >
            <div className="text-sm">Welcome to {organization.name}</div>
          </div>

          {/* Logo and organization name */}
          <div className="container mx-auto py-4 px-4">
            <div className="flex items-center justify-center">
              {organization.logo_url ? (
                <Image
                  src={organization.logo_url}
                  alt={`${organization.name} Logo`}
                  className="h-16 md:h-24 w-auto mr-4"
                />
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
                <h1
                  className="text-2xl md:text-5xl uppercase font-medium"
                  style={{ color: "var(--color-primary, #161659)" }}
                >
                  {organization.name}
                </h1>
                <p
                  className="text-sm md:text-2xl uppercase hidden md:block"
                  style={{ color: "var(--color-secondary, #b70f0f)" }}
                >
                  Excellence in Sports
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation teams={teams} navLinks={navLinks} />

        <main className="flex-grow">{children}</main>

        {/* Simple Footer */}
        <footer
          className="font-oswald text-white py-10 px-5"
          style={{ backgroundColor: "var(--color-secondary)" }}
        >
          <div className="max-w-screen-xl mx-auto text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{organization.name}</h2>
              <p className="opacity-90">Excellence in Sports</p>
            </div>

            <div className="border-t border-white/20 pt-6">
              <p className="text-sm">
                © 2024 {organization.name}. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </OrganizationProvider>
  );
}
