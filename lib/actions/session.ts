// app/actions.ts (or lib/actions/session.ts)
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Define types for better TypeScript support
interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  font_family: string | null;
  theme_name: string | null;
}

interface UserOrganizationRole {
  organization_id: string;
  role: string;
  organizations: Organization;
}

// Cache the user organizations query to avoid repeated DB calls
export const getUserOrganizations = cache(
  async (userId: string): Promise<UserOrganizationRole[]> => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: userOrgRoles, error } = await supabase
      .from("user_organization_roles")
      .select(
        `
      organization_id,
      role,
      organizations (
        id, 
        name, 
        subdomain,
        primary_color,
        secondary_color,
        logo_url,
        font_family,
        theme_name
      )
    `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user organizations:", error);
      return [];
    }

    return (
      userOrgRoles?.map((role: UserOrganizationRole) => ({
        ...role,
        organizations: {
          id: role.organizations.id,
          name: role.organizations.name,
          subdomain: role.organizations.subdomain ?? null,
          primary_color: role.organizations.primary_color ?? null,
          secondary_color: role.organizations.secondary_color ?? null,
          logo_url: role.organizations.logo_url ?? null,
          font_family: role.organizations.font_family ?? null,
          theme_name: role.organizations.theme_name ?? null,
        },
      })) || []
    );
  }
);

// Cache the current user session to avoid repeated auth calls
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching current user:", error);
    return null;
  }

  return user;
});

// Get organization from cookie or default to first org
export const getCurrentOrganization = cache(
  async (
    userOrgRoles: UserOrganizationRole[]
  ): Promise<{
    org: Organization | null;
    role: string | null;
  }> => {
    if (!userOrgRoles || userOrgRoles.length === 0) {
      return { org: null, role: null };
    }

    // TODO: Later you can implement org switching with cookies
    // For now, just use the first organization
    const currentOrgRole = userOrgRoles[0];
    const org = Array.isArray(currentOrgRole.organizations)
      ? currentOrgRole.organizations[0]
      : currentOrgRole.organizations;

    return {
      org: org || null,
      role: currentOrgRole.role,
    };
  }
);

// Main session data fetcher - this replaces multiple individual queries
export const getSessionData = cache(async () => {
  console.log(
    "🔄 Fetching session data (should only see this once per request)"
  );

  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      userOrgRoles: [],
      currentOrg: null,
      currentRole: null,
      isLoading: false,
    };
  }

  const userOrgRoles = await getUserOrganizations(user.id);
  const { org: currentOrg, role: currentRole } = await getCurrentOrganization(
    userOrgRoles
  );

  return {
    user,
    userOrgRoles,
    currentOrg,
    currentRole,
    isLoading: false,
  };
});
