// context/OrganizationProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client"; // Your Supabase client

// Define the shape of your organization's data
interface Organization {
  name: string;
  primary_color: string | null;
  logo_url: string | null;
  // Add other fields as needed
}

const OrganizationContext = createContext<Organization | null>(null);

export function OrganizationProvider({
  subdomain,
  children,
}: {
  subdomain: string;
  children: ReactNode;
}) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrganization = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("name, primary_color, logo_url")
        .eq("subdomain", subdomain)
        .single();

      if (error) {
        console.error("Error fetching organization:", error);
      } else {
        setOrganization(data);
      }
    };

    fetchOrganization();
  }, [subdomain, supabase]);

  return (
    <OrganizationContext.Provider value={organization}>
      {children}
    </OrganizationContext.Provider>
  );
}

// Custom hook to easily access the organization's data
export const useOrganization = () => useContext(OrganizationContext);
