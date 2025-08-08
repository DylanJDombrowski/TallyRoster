// app/sites/[subdomain]/layout.tsx
// Remove the dynamic import attempt and import theme directly

import Navigation from "@/app/components/Navigation";
import { ThemeProvider } from "@/app/components/theme-provider";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { ThemeListener } from "@/app/components/ThemeListener";
import { OrganizationProvider } from "@/context/OrganizationProvider";
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "./components/Footer";
import { getFontClassName } from "@/lib/utils/fonts";
import { ThemeStyle } from "@/app/components/theme-style";

// Import all theme CSS files statically
import "@/app/styles/themes/default.css";
import "@/app/styles/themes/forest.css";
import "@/app/styles/themes/ocean.css";
import "@/app/styles/themes/sunset.css";
import "@/app/styles/themes/royal.css";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

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

  // Get theme name and font class
  const themeName = organization.theme_name || "default";
  const fontClassName = getFontClassName(organization.font_family || "Inter");

  return (
    <html lang="en" className={`theme-${themeName}`}>
      <ThemeProvider>
        <body
          className={`${fontClassName} bg-background text-foreground transition-colors duration-300`}
        >
          <OrganizationProvider organization={organization}>
            {/* Keep your existing ThemeStyle component for backwards compatibility */}
            {organization.primary_color && organization.secondary_color && (
              <ThemeStyle
                primaryColor={organization.primary_color}
                secondaryColor={organization.secondary_color}
                primaryFgColor="#ffffff"
                organizationName={organization.name}
                theme={organization.theme || "light"}
              />
            )}

            <ThemeListener />
            <AnalyticsTracker organizationId={organization.id} />

            {/* Theme Toggle Button */}
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeToggle />
            </div>

            <div className="flex flex-col min-h-screen">
              <header className="font-oswald bg-white dark:bg-gray-800 shadow-sm">
                <div className="py-1 px-4 text-white text-center bg-secondary">
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
                      <div className="h-16 md:h-24 w-16 md:w-24 mr-4 rounded-full flex items-center justify-center text-white font-bold text-xl bg-primary">
                        {organization.name?.charAt(0) || "O"}
                      </div>
                    )}
                    <div className="text-center md:text-left">
                      <h1 className="text-2xl md:text-5xl uppercase font-medium text-primary">
                        {organization.name}
                      </h1>
                      <p className="text-sm md:text-2xl uppercase hidden md:block text-secondary">
                        {organization.slogan || "Excellence in Sports"}
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <Navigation teams={teams} organization={organization} />
              <main className="flex-grow">{children}</main>
              <Footer organization={organization} />
            </div>
          </OrganizationProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}
