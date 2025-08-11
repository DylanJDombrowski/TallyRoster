// lib/types.ts - Single source of truth for all types and schemas
import { z } from "zod";
import { Database } from "./database.types";

// ============================================================================
// FORM SCHEMAS - Single source of truth for validation
// ============================================================================

// Enhanced Player schema
export const PlayerFormSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(2, "First name must be at least 2 characters."),
  last_name: z.string().min(2, "Last name must be at least 2 characters."),
  jersey_number: z.coerce
    .number()
    .int()
    .positive("Jersey must be a positive number.")
    .nullable(),
  position: z.string().nullable(),
  team_id: z.string().uuid("You must select a team."),
  headshot_url: z.string().url().nullable(),
  height: z.string().nullable(),
  bats: z.enum(["L", "R", "S"]).nullable(), // Left, Right, Switch
  throws: z.enum(["L", "R"]).nullable(),
  town: z.string().nullable(),
  school: z.string().nullable(),
  grad_year: z.coerce.number().int().min(2020).max(2035).nullable(),
  gpa: z.coerce.number().min(0).max(4.0).nullable(),
  twitter_handle: z.string().nullable(),
  parent_email: z.string().email("Invalid email address.").nullable(),
});

export const PlayerStatusSchema = z.object({
  playerId: z.string().uuid(),
  status: z.enum(["active", "archived"]),
});

// Coach schema
export const CoachFormSchema = z.object({
  id: z.string().uuid().optional(),
  team_id: z.string().uuid("You must select a team."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  position: z.string().min(2, "Position is required."),
  email: z.string().email("Invalid email address.").nullable(),
  phone: z.string().nullable(),
  image_url: z.string().url().nullable(),
  bio: z.string().nullable(),
  order_index: z.coerce.number().int().min(0).default(0),
});

// Schedule Event schema
export const ScheduleEventFormSchema = z.object({
  id: z.string().uuid().optional(),
  team_id: z.string().uuid("You must select a team."),
  event_date: z.string().min(1, "Event date is required."),
  event_name: z.string().min(2, "Event name must be at least 2 characters."),
  location: z.string().nullable(),
  sanction: z.string().nullable(),
  event_type: z.enum(["tournament", "practice", "game"]).default("tournament"),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  notes: z.string().nullable(),
  is_home: z.boolean().default(false),
});

// Team schema - FIXED to match both form needs and database schema
export const TeamFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Team name must be at least 2 characters"),
  season: z.string().min(1, "Season is required"),
  year: z.coerce.number().int().min(2020).max(2035).optional(),
  team_image_url: z.string().url().optional().or(z.literal("")),
  // Force these to be strings with defaults to avoid conflicts
  primary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be valid hex color")
    .default("#161659"),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be valid hex color")
    .default("#BD1515"),
  // Coach fields for form handling
  coach_name: z.string().optional(),
  coach_email: z.string().email("Invalid email").optional().or(z.literal("")),
  coach_phone: z.string().optional(),
});

// ============================================================================
// ONBOARDING SCHEMAS - Consolidated from app/types/onboarding.ts
// ============================================================================

export const OrganizationFormSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  organizationType: z.string().min(1, "Organization type is required"),
  sport: z.string().optional(),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .regex(
      /^[a-z0-9]+$/,
      "Subdomain can only contain lowercase letters and numbers"
    ),
  yourRole: z.string().default("admin"),
});

export const VisualCustomizationSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be valid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be valid hex color"),
  logo: z.instanceof(File).nullable(),
  logoPreview: z.string().optional(),
});

export const PlanSelectionSchema = z.object({
  selectedPlan: z.enum(["starter", "pro", "elite"]),
});

// ============================================================================
// INFERRED TYPES - Generated from schemas
// ============================================================================

export type PlayerFormData = z.infer<typeof PlayerFormSchema>;
export type PlayerStatusData = z.infer<typeof PlayerStatusSchema>;
export type CoachFormData = z.infer<typeof CoachFormSchema>;
export type ScheduleEventFormData = z.infer<typeof ScheduleEventFormSchema>;
export type TeamFormData = z.infer<typeof TeamFormSchema>;

// Onboarding types
export type OrganizationFormData = z.infer<typeof OrganizationFormSchema>;
export type VisualCustomizationData = z.infer<typeof VisualCustomizationSchema>;
export type PlanSelectionData = z.infer<typeof PlanSelectionSchema>;

export interface OnboardingWizardData
  extends OrganizationFormData,
    VisualCustomizationData,
    PlanSelectionData {}

export interface OnboardingStepProps {
  onNext: (data?: Record<string, unknown>) => void;
  onBack: () => void;
  data: Partial<OnboardingWizardData>;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

export interface SubdomainCheckResponse {
  available: boolean;
  subdomain?: string;
  error?: string;
}

export type ColorPreset = {
  name: string;
  primary: string;
  secondary: string;
};

// ============================================================================
// DATABASE TYPES - Direct from Supabase
// ============================================================================

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Coach = Database["public"]["Tables"]["coaches"]["Row"];
export type ScheduleEvent =
  Database["public"]["Tables"]["schedule_events"]["Row"];
export type PlayerStats = Database["public"]["Tables"]["player_stats"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type Sponsor = Database["public"]["Tables"]["sponsors"]["Row"];

// ============================================================================
// EXTENDED TYPES - For UI components with relations
// ============================================================================

export type TeamWithDetails = Team & {
  players: Player[];
  coaches: Coach[];
  schedule_events: ScheduleEvent[];
};

export type PlayerWithTeam = Player & {
  teams: Pick<Team, "name" | "season"> | null;
};

export type CoachWithTeam = Coach & {
  teams: Pick<Team, "name" | "season"> | null;
};

// ============================================================================
// UTILITY TYPES - For different views and components
// ============================================================================

export type TeamListItem = Pick<
  Team,
  | "id"
  | "name"
  | "season"
  | "year"
  | "team_image_url"
  | "primary_color"
  | "secondary_color"
>;

export type PlayerCardData = Pick<
  Player,
  | "id"
  | "first_name"
  | "last_name"
  | "jersey_number"
  | "position"
  | "headshot_url"
  | "grad_year"
  | "height"
  | "town"
  | "school"
>;

export type CoachCardData = Pick<
  Coach,
  "id" | "name" | "position" | "image_url" | "email" | "phone" | "bio"
>;

// ============================================================================
// HELPER FUNCTIONS - Image URL handling
// ============================================================================

export const getPlayerImageUrl = (path: string | null | undefined): string => {
  const defaultImage = "/assets/teams/defaultpfp.jpg";

  if (!path) return defaultImage;

  // If the path is already a full URL, return it directly
  if (path.startsWith("http")) {
    return path;
  }

  // Otherwise, construct the full URL for legacy Supabase storage
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/player-headshots${path}`;
};

export const getTeamImageUrl = (path: string | null | undefined): string => {
  const defaultImage = "/assets/logos/mvxLogo2.png";

  if (!path) return defaultImage;

  // If the path is already a full URL, return it directly
  if (path.startsWith("http")) {
    return path;
  }

  // Otherwise, construct the full URL for legacy Supabase storage
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team-photos${path}`;
};

export const getCoachImageUrl = (coach: Coach): string => {
  if (coach.image_url) return coach.image_url;
  return "/assets/teams/defaultpfp.jpg"; // fallback image
};

// ============================================================================
// HELPER FUNCTIONS - Season generation
// ============================================================================

export const generateSeasonOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let i = 0; i < 4; i++) {
    const startYear = currentYear + i;
    const endYear = (startYear + 1).toString().slice(-2);
    options.push(`${startYear}-${endYear}`);
  }
  return options;
};
