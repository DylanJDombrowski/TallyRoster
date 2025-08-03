// app/dashboard/layout.tsx
import { ThemeStyle } from "@/app/components/theme-style";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogoutButton } from "./components/logout-button";
import { OrganizationSwitcher } from "./components/organization-switcher";
import { SidebarNav } from "./components/sidebar-nav";
import { SessionProvider } from "@/hooks/use-session";
import { getSessionData } from "@/lib/actions/session";

// Separate theme injector component that uses session data
function ThemeInjector({
  primaryColor = "#171717",
  secondaryColor = "#e5e5e5",
  organizationName = "Admin",
}: {
  primaryColor?: string;
  secondaryColor?: string;
  organizationName?: string;
}) {
  const primaryFgColor = "#ffffff";

  return (
    <ThemeStyle
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      primaryFgColor={primaryFgColor}
      organizationName={organizationName}
    />
  );
}

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
    redirect("/onboarding"); // or "/no-organization" page
  }

  // Extract theme data from current organization
  const themeProps = {
    primaryColor: sessionData.currentOrg?.primary_color || "#171717",
    secondaryColor: sessionData.currentOrg?.secondary_color || "#e5e5e5",
    organizationName: sessionData.currentOrg?.name || "Admin",
  };

  return (
    <SessionProvider value={sessionData}>
      <ThemeInjector {...themeProps} />
      <div className="min-h-screen bg-slate-100">
        <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 md:left-64">
          <h1 className="text-xl font-bold text-slate-900 md:hidden">
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

        <aside className="fixed top-0 left-0 hidden w-64 h-full bg-white border-r border-slate-200 md:block">
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-slate-900">
              {sessionData.currentOrg?.name}
            </h1>
          </div>
          <SidebarNav userRole={sessionData.currentRole || "member"} />
        </aside>

        <main className="pt-16 md:pl-64">{children}</main>
      </div>
    </SessionProvider>
  );
}
