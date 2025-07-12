// app/dashboard/components/organization-switcher.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrgId?: string;
}

export function OrganizationSwitcher({ organizations, currentOrgId }: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  const handleOrgSwitch = async (orgId: string) => {
    // For now, we'll just reload the page
    // Later you can implement more sophisticated state management
    const url = new URL(window.location.href);
    url.searchParams.set("org", orgId);
    window.location.href = url.toString();
  };

  if (organizations.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
      >
        <div className="text-left">
          <div className="font-medium">{currentOrg?.name}</div>
          <div className="text-xs text-slate-500 capitalize">{currentOrg?.role}</div>
        </div>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  handleOrgSwitch(org.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                  org.id === currentOrgId ? "bg-blue-50 text-blue-700" : "text-slate-700"
                }`}
              >
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-slate-500 capitalize">{org.role}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
