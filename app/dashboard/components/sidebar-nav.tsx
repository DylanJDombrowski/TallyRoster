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
              isActive ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
