// context/OrganizationProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { Database } from "@/lib/database.types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

const OrganizationContext = createContext<Organization | null>(null);

export function OrganizationProvider({
  organization,
  children,
}: {
  organization: Organization;
  children: ReactNode;
}) {
  return (
    <OrganizationContext.Provider value={organization}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
