// app/dashboard/layout.tsx

import { ThemeStyle } from "@/app/components/theme-style"; // Import the new component
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { LogoutButton } from "./components/logout-button";
import { SidebarNav } from "./components/sidebar-nav";

// This component fetches data on the server.
async function ThemeInjector() {
  const cookieStore = cookies();
  const supabase = createClient(await cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let primaryColor = "#171717"; // Default to black for admin
  let secondaryColor = "#e5e5e5"; // Default to light gray for admin

  if (user) {
    const { data: userRole } = await supabase.from("user_roles").select("team_id").eq("user_id", user.id).single();

    if (userRole?.team_id) {
      const { data: teamData } = await supabase.from("teams").select("primary_color, secondary_color").eq("id", userRole.team_id).single();

      // Use team colors if they exist
      if (teamData?.primary_color) primaryColor = teamData.primary_color;
      if (teamData?.secondary_color) secondaryColor = teamData.secondary_color;
    }
  }

  const primaryFgColor = "#ffffff"; // Assuming white text on primary color is always desired

  // It then passes the server-fetched data as props to the client component.
  return <ThemeStyle primaryColor={primaryColor} secondaryColor={secondaryColor} primaryFgColor={primaryFgColor} />;
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeInjector />
      {/* Updated background to bg-slate-100 */}
      <div className="min-h-screen bg-slate-100">
        <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 md:left-64">
          <h1 className="text-xl font-bold text-slate-900 md:hidden">MVX Admin</h1>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </header>

        <aside className="fixed top-0 left-0 hidden w-64 h-full bg-white border-r border-slate-200 md:block">
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-slate-900">MVX Admin</h1>
          </div>
          <SidebarNav />
        </aside>

        <main className="pt-16 md:pl-64">{children}</main>
      </div>
    </>
  );
}
