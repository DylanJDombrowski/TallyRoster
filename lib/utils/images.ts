// lib/utils/images.ts - Image handling utilities
import type { Coach } from '@/lib/types';

/**
 * Get player image URL with fallback
 */
export const getPlayerImageUrl = (path: string | null | undefined): string => {
  const defaultImage = "/assets/teams/defaultpfp.jpg";

  if (!path) return defaultImage;

  // If the path is already a full URL, return it directly
  if (path.startsWith("http")) {
    return path;
  }

  // Otherwise, construct the full URL from the Supabase storage
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/player-headshots${path}`;
};

/**
 * Get team image URL with fallback
 */
export const getTeamImageUrl = (path: string | null | undefined): string => {
  const defaultImage = "/assets/logos/mvxLogo2.png";

  if (!path) return defaultImage;

  // If the path is already a full URL, return it directly
  if (path.startsWith("http")) {
    return path;
  }

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-photos${path}`;
};

/**
 * Get coach image URL with fallback
 */
export const getCoachImageUrl = (coach: Coach): string => {
  if (coach.image_url) return coach.image_url;
  return "/assets/teams/defaultpfp.jpg"; // fallback image
};