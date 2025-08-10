// app/dashboard/layout.tsx
import { ThemeProvider } from "@/app/components/theme-provider";
import { ThemeStyle } from "@/app/components/theme-style";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogoutButton } from "./components/logout-button";
import { OrganizationSwitcher } from "./components/organization-switcher";
import { SidebarNav } from "./components/sidebar-nav";
import { SessionProvider } from "@/hooks/use-session";
import { getSessionData } from "@/lib/services";
import { getFontClassName } from "@/lib/utils/fonts";

// Import theme CSS files
import "@/app/styles/themes/default.css";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Single call to get all session data - cached across the request
  const sessionData = await getSessionData();

  // Handle unauthenticated users
  if (!sessionData.user) {
    redirect("/login");
  }

  // Handle users with no organization roles (removed from all orgs)
  if (!sessionData.userOrgRoles || sessionData.userOrgRoles.length === 0) {
    redirect("/onboarding");
  }

  // Extract theme data from current organization
  const primaryColor = sessionData.currentOrg?.primary_color || "#161659";
  const secondaryColor = sessionData.currentOrg?.secondary_color || "#BD1515";
  const organizationName = sessionData.currentOrg?.name || "Admin";
  const fontClassName = getFontClassName(
    sessionData.currentOrg?.font_family || "Inter"
  );
  const themeName = sessionData.currentOrg?.theme_name || "default";

  return (
    <SessionProvider value={sessionData}>
      <div
        className={`theme-${themeName} ${fontClassName} min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          {/* Inject custom colors if they exist */}
          {primaryColor && secondaryColor && (
            <ThemeStyle
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              primaryFgColor="#ffffff"
              organizationName={organizationName}
            />
          )}

          <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 md:left-64">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 md:hidden">
                {sessionData.currentOrg?.name}
              </h1>
              <div className="ml-auto flex items-center gap-4">
                {sessionData.userOrgRoles.length > 1 && (
                  <OrganizationSwitcher
                    organizations={sessionData.userOrgRoles.map((role) => ({
                      id: role.organization_id,
                      name: role.organizations.name,
                      role: role.role,
                    }))}
                    currentOrgId={sessionData.currentOrg?.id}
                  />
                )}
                <LogoutButton />
              </div>
            </header>

            <aside className="fixed top-0 left-0 hidden w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 md:block">
              <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {sessionData.currentOrg?.name}
                </h1>
              </div>
              <SidebarNav userRole={sessionData.currentRole || "member"} />
            </aside>

            <main className="pt-16 md:pl-64">
              <div className="p-4 md:p-8">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </div>
    </SessionProvider>
  );
}
