// lib/types.ts - Updated types for extended schema
import { z } from "zod";
import { Database } from "./database.types";

// Enhanced Player schema with all the new fields
export const PlayerFormSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(2, "First name must be at least 2 characters."),
  last_name: z.string().min(2, "Last name must be at least 2 characters."),
  jersey_number: z.coerce.number().int().positive("Jersey must be a positive number.").nullable(),
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

// Team schema update
export const TeamFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Team name must be at least 3 characters."),
  season: z.string().min(4, "Season must be at least 4 characters.").nullable(),
  year: z.coerce.number().int().min(2020).max(2035).nullable(),
  team_image_url: z.string().url().nullable(),
  primary_color: z.string().default("#161659"),
  secondary_color: z.string().default("#BD1515"),
});

// Infer types from schemas
export type PlayerFormData = z.infer<typeof PlayerFormSchema>;
export type CoachFormData = z.infer<typeof CoachFormSchema>;
export type ScheduleEventFormData = z.infer<typeof ScheduleEventFormSchema>;
export type TeamFormData = z.infer<typeof TeamFormSchema>;

// Base types from database
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Coach = Database["public"]["Tables"]["coaches"]["Row"];
export type ScheduleEvent = Database["public"]["Tables"]["schedule_events"]["Row"];
export type PlayerStats = Database["public"]["Tables"]["player_stats"]["Row"];

// Extended types for UI components
export type TeamWithDetails = Team & {
  players: Player[];
  coaches: Coach[];
  schedule_events: ScheduleEvent[];
};

export type PlayerWithTeam = Player & {
  teams: Pick<Team, "name"> | null;
};

export type CoachWithTeam = Coach & {
  teams: Pick<Team, "name"> | null;
};

// Utility types for different views
export type TeamListItem = Pick<Team, "id" | "name" | "season" | "year" | "team_image_url">;
export type PlayerCardData = Pick<Player, "id" | "first_name" | "last_name" | "jersey_number" | "position" | "headshot_url" | "grad_year">;
export type CoachCardData = Pick<Coach, "id" | "name" | "position" | "image_url" | "email" | "phone">;

// Image handling utilities
export const getPlayerImageUrl = (player: Player): string => {
  if (player.headshot_url) return player.headshot_url;
  return "/assets/teams/defaultpfp.jpg"; // fallback image
};

export const getTeamImageUrl = (team: Team): string => {
  if (team.team_image_url) return team.team_image_url;
  return "/assets/logos/mvxLogo2.png"; // fallback image
};

export const getCoachImageUrl = (coach: Coach): string => {
  if (coach.image_url) return coach.image_url;
  return "/assets/teams/defaultpfp.jpg"; // fallback image
};
