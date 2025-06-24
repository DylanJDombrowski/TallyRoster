// app/dashboard/layout.tsx
import { ReactNode } from "react";
import { LogoutButton } from "./components/logout-button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <h1 className="text-xl font-bold">MVX Admin</h1>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
