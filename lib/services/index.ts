// lib/services/index.ts - Barrel export for all services with explicit re-exports
export * from "./validation";
export * from "./error-handling";

// Database services (excluding getCurrentUser to avoid conflict)
export {
  getServerClient,
  getUserOrganizationRoles,
  getCurrentUserOrganization,
} from "./database";
export type { DatabaseClient } from "./database";

// Session services (these are the preferred ones to use)
export {
  getUserOrganizations,
  getCurrentUser, // Use this one from session.ts
  getCurrentOrganization,
  getSessionData,
} from "./session";
