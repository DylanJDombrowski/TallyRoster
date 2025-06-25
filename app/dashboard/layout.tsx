// app/dashboard/layout.tsx
import { Team } from "@/lib/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { LogoutButton } from "./components/logout-button";

// A server component to fetch data and set theme colors
async function ThemeManager() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let team: Team | null = null;
  if (user) {
    const { data: userRole } = await supabase.from("user_roles").select("team_id").eq("user_id", user.id).single();

    if (userRole?.team_id) {
      const { data: teamData } = await supabase.from("teams").select("*").eq("id", userRole.team_id).single();
      team = teamData;
    }
  }

  const primaryColor = team?.primary_color || "#171717"; // Default to black
  const secondaryColor = team?.secondary_color || "#e5e5e5"; // Default to light gray
  const primaryFgColor = "#ffffff"; // Assuming white text on primary color

  return (
    <style jsx global>{`
      :root {
        --color-primary: ${primaryColor};
        --color-secondary: ${secondaryColor};
        --color-primary-foreground: ${primaryFgColor};
      }
    `}</style>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // Use a light slate background for the whole page
    <div className="min-h-screen bg-slate-50">
      <ThemeManager />
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">MVX Admin</h1>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
