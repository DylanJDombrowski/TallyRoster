// lib/config/domains.ts - TallyRoster Domain Configuration
export const DOMAIN_CONFIG = {
  // Primary domain
  PRIMARY_DOMAIN: "tallyroster.com",

  // Legacy domain (for redirects)
  LEGACY_DOMAIN: "trysideline.com",

  // Environment-specific URLs
  APP_URL: process.env.NODE_ENV === "production" ? "https://tallyroster.com" : "http://localhost:3000",

  // API URLs
  API_URL: process.env.NODE_ENV === "production" ? "https://tallyroster.com/api" : "http://localhost:3000/api",

  // Email addresses
  SUPPORT_EMAIL: "support@tallyroster.com",
  NO_REPLY_EMAIL: "noreply@tallyroster.com",

  // Social/Marketing URLs
  MARKETING_URL: "https://tallyroster.com",
  BLOG_URL: "https://tallyroster.com/blog",

  // Organization subdomain pattern
  getOrgUrl: (subdomain: string) =>
    process.env.NODE_ENV === "production" ? `https://${subdomain}.tallyroster.com` : `http://${subdomain}.localhost:3000`,

  // Check if hostname is legacy domain
  isLegacyDomain: (hostname: string) => hostname.includes("trysideline.com"),

  // Get new hostname from legacy
  migrateLegacyHostname: (hostname: string) => hostname.replace("trysideline.com", "tallyroster.com"),
};

// lib/hooks/useDomain.ts - React hook for domain info
import { useMemo } from "react";

export function useDomain() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  return useMemo(() => {
    const isLocal = hostname.includes("localhost");
    const isPrimary = hostname === DOMAIN_CONFIG.PRIMARY_DOMAIN || hostname === `www.${DOMAIN_CONFIG.PRIMARY_DOMAIN}`;
    const isSubdomain = hostname.endsWith(`.${DOMAIN_CONFIG.PRIMARY_DOMAIN}`);
    const subdomain = isSubdomain ? hostname.split(".")[0] : null;

    return {
      hostname,
      isLocal,
      isPrimary,
      isSubdomain,
      subdomain,
      primaryDomain: DOMAIN_CONFIG.PRIMARY_DOMAIN,
      appUrl: DOMAIN_CONFIG.APP_URL,
    };
  }, [hostname]);
}
