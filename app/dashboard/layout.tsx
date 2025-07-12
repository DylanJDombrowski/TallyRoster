// app/dashboard/layout.tsx
import { ThemeStyle } from "@/app/components/theme-style";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { LogoutButton } from "./components/logout-button";
import { OrganizationSwitcher } from "./components/organization-switcher";
import { SidebarNav } from "./components/sidebar-nav";

// This component fetches data on the server.
async function ThemeInjector() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let primaryColor = "#171717"; // Default colors
  let secondaryColor = "#e5e5e5";
  let organizationName = "Admin"; // Default name

  if (user) {
    // Get the user's current organization (first one for now)
    const { data: userOrgRole } = await supabase
      .from("user_organization_roles")
      .select(
        `
        organization_id,
        role,
        organizations (
          id, name, primary_color, secondary_color
        )
      `
      )
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (userOrgRole?.organizations) {
      const org = Array.isArray(userOrgRole.organizations) ? userOrgRole.organizations[0] : userOrgRole.organizations;

      if (org.primary_color) primaryColor = org.primary_color;
      if (org.secondary_color) secondaryColor = org.secondary_color;
      if (org.name) organizationName = org.name;
    }
  }

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

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has any organization roles
  const { data: userOrgRoles } = await supabase
    .from("user_organization_roles")
    .select(
      `
      organization_id,
      role,
      organizations (
        id, name, subdomain
      )
    `
    )
    .eq("user_id", user.id);

  // If no organization roles, redirect to onboarding
  if (!userOrgRoles || userOrgRoles.length === 0) {
    redirect("/onboarding");
  }

  // Get current organization (for now, use the first one)
  const currentOrgRole = userOrgRoles[0];
  const currentOrg = Array.isArray(currentOrgRole.organizations) ? currentOrgRole.organizations[0] : currentOrgRole.organizations;

  return (
    <>
      <ThemeInjector />
      <div className="min-h-screen bg-slate-100">
        <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 md:left-64">
          <h1 className="text-xl font-bold text-slate-900 md:hidden">{currentOrg?.name}</h1>
          <div className="ml-auto flex items-center gap-4">
            {userOrgRoles.length > 1 && (
              <OrganizationSwitcher
                organizations={userOrgRoles.map((role) => ({
                  id: role.organization_id,
                  name: Array.isArray(role.organizations)
                    ? role.organizations[0]?.name || "Unknown"
                    : role.organizations?.name || "Unknown",
                  role: role.role,
                }))}
                currentOrgId={currentOrg?.id}
              />
            )}
            <LogoutButton />
          </div>
        </header>

        <aside className="fixed top-0 left-0 hidden w-64 h-full bg-white border-r border-slate-200 md:block">
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-slate-900">{currentOrg?.name}</h1>
          </div>
          <SidebarNav userRole={currentOrgRole.role} />
        </aside>

        <main className="pt-16 md:pl-64">{children}</main>
      </div>
    </>
  );
}
