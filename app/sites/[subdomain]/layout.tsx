// app/sites/[subdomain]/layout.tsx - FIXED WITH DYNAMIC NAVIGATION
import Navigation from "@/app/components/Navigation";
import { ThemeStyle } from "@/app/components/theme-style";
import { ThemeListener } from "@/app/components/ThemeListener";
import { OrganizationProvider } from "@/context/OrganizationProvider";
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

async function getOrganizationData(subdomain: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log(`🎨 Loading organization data for subdomain: ${subdomain}`);

  // Fetch ALL organization fields including navigation settings
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*") // This ensures we get ALL fields including navigation settings
    .eq("subdomain", subdomain)
    .single();

  if (error || !organization) {
    console.error(
      `❌ Error loading organization for subdomain ${subdomain}:`,
      error
    );
    return { organization: null, teams: [] };
  }

  console.log(`✅ Loaded organization data:`, {
    name: organization.name,
    theme: organization.theme,
    primaryColor: organization.primary_color,
    secondaryColor: organization.secondary_color,
    slogan: organization.slogan,
    showAlumni: organization.show_alumni,
    showBlog: organization.show_blog,
    showFormsLinks: organization.show_forms_links,
    showSponsors: organization.show_sponsors,
    showSocial: organization.show_social,
  });

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

  // Ensure we have fallback values for theme properties
  const primaryColor = organization.primary_color || "#161659";
  const secondaryColor = organization.secondary_color || "#BD1515";
  const theme = organization.theme || "light";
  const slogan = organization.slogan || "Excellence in Sports";

  console.log(`🎨 Applying theme to ${subdomain}:`, {
    primaryColor,
    secondaryColor,
    theme,
    slogan,
  });

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <body className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <OrganizationProvider organization={organization}>
          <ThemeStyle
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            primaryFgColor="#ffffff"
            organizationName={organization.name}
            theme={theme}
          />
          <ThemeListener />
          <AnalyticsTracker organizationId={organization.id} />
          <div className="flex flex-col min-h-screen">
            <header className="font-oswald bg-white dark:bg-gray-800 shadow-sm">
              <div
                className="py-1 px-4 text-white text-center"
                style={{ backgroundColor: secondaryColor }}
              >
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
                      style={{ backgroundColor: primaryColor }}
                    >
                      {organization.name?.charAt(0) || "O"}
                    </div>
                  )}
                  <div className="text-center md:text-left">
                    <h1
                      className="text-2xl md:text-5xl uppercase font-medium text-gray-800 dark:text-gray-100"
                      style={{ color: primaryColor }}
                    >
                      {organization.name}
                    </h1>
                    <p
                      className="text-sm md:text-2xl uppercase hidden md:block"
                      style={{ color: secondaryColor }}
                    >
                      {slogan}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* FIXED: Pass organization data to Navigation for dynamic behavior */}
            <Navigation teams={teams} organization={organization} />
            <main className="flex-grow">{children}</main>

            <footer
              className="font-oswald text-white py-10 px-5"
              style={{ backgroundColor: secondaryColor }}
            >
              <div className="max-w-screen-xl mx-auto text-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {organization.name}
                  </h2>
                  <p className="opacity-90">{slogan}</p>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <p className="text-sm">
                    © {new Date().getFullYear()} {organization.name}. All Rights
                    Reserved.
                  </p>
                  {organization.subdomain && (
                    <p className="text-xs opacity-75 mt-1">
                      Powered by TallyRoster
                    </p>
                  )}
                </div>
              </div>
            </footer>
          </div>
        </OrganizationProvider>
      </body>
    </html>
  );
}
