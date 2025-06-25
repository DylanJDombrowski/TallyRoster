// app/dashboard/layout.tsx

import { ThemeStyle } from "@/app/components/theme-style"; // Import the new component
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { LogoutButton } from "./components/logout-button";

// This component fetches data on the server.
async function ThemeInjector() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ThemeInjector />
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">MVX Admin</h1>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
