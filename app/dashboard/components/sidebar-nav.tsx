// app/dashboard/components/sidebar-nav.tsx
"use client";

import {
  BarChart3,
  ExternalLink,
  FileText,
  Home,
  Mail,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: string[]; // Which roles can see this link
}

const navLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    roles: ["admin", "coach", "member"],
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["admin", "coach"],
  },
  {
    href: "/dashboard/players",
    label: "Players",
    icon: User,
    roles: ["admin", "coach"],
  },
  {
    href: "/dashboard/games",
    label: "Games",
    icon: Trophy,
    roles: ["admin", "coach"],
  },
  {
    href: "/dashboard/communications",
    label: "Communications",
    icon: Mail,
    roles: ["admin", "coach"],
  },
  {
    href: "/dashboard/admin/teams",
    label: "Teams",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/dashboard/admin/users",
    label: "Users",
    icon: Shield,
    roles: ["admin"],
  },
  {
    href: "/dashboard/admin/sponsors",
    label: "Sponsors",
    icon: ExternalLink,
    roles: ["admin"],
  },
  {
    href: "/dashboard/admin/domains",
    label: "Domains",
    icon: ExternalLink,
    roles: ["admin"],
  },
  {
    href: "/dashboard/site-customizer",
    label: "Website",
    icon: Settings,
    roles: ["admin"],
  },
  {
    href: "/dashboard/blog",
    label: "Blog Posts",
    icon: FileText,
    roles: ["admin", "coach"],
  },
];

interface SidebarNavProps {
  userRole: string;
}

export function SidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname();

  // Filter links based on user role
  const availableLinks = navLinks.filter((link) =>
    link.roles.includes(userRole)
  );

  return (
    <nav className="flex flex-col p-4 space-y-2">
      {availableLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-200 text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </Link>
        );
      })}

      {/* Role indicator */}
      <div className="mt-8 pt-4 border-t border-slate-200">
        <div className="px-3 py-2 text-xs text-slate-500">
          <div>Your Role</div>
          <div className="font-medium text-slate-700 capitalize mt-1">
            {userRole}
          </div>
        </div>
      </div>
    </nav>
  );
}
