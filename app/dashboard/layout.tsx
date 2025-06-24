// app/dashboard/layout.tsx
import { ReactNode } from "react";
import { LogoutButton } from "./components/logout-button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // Use a light slate background for the whole page
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">MVX Admin</h1>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
