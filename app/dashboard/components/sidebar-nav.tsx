// app/dashboard/components/sidebar-nav.tsx
"use client";

import { Home, Shield, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/players", label: "Players", icon: User },
  { href: "/dashboard/admin/teams", label: "Teams", icon: Users },
  { href: "/dashboard/admin/users", label: "Users", icon: Shield },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col p-4 space-y-2">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-200 text-slate-900" // Updated active colors
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900" // Updated inactive colors
            }`}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
