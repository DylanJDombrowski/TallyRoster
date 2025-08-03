// hooks/use-session.ts
"use client";

import { createContext, useContext, ReactNode } from "react";
import { User } from "@supabase/supabase-js";

// Define the organization structure based on your database
interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
}

interface UserOrganizationRole {
  organization_id: string;
  role: string;
  organizations: Organization;
}

interface SessionContextType {
  user: User | null;
  userOrgRoles: UserOrganizationRole[];
  currentOrg: Organization | null;
  currentRole: string | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
  value: SessionContextType;
}

export const SessionProvider = ({ children, value }: SessionProviderProps) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
