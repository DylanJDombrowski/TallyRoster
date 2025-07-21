// lib/types-new.ts - Updated types file using new organized structure
// Re-export types (avoiding conflicts with schemas)
export * from './types/database';
export * from './types/extended';
export * from './types/auth';

// Re-export utility functions
export { getPlayerImageUrl, getTeamImageUrl, getCoachImageUrl } from './utils/images';