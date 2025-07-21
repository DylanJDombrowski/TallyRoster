// lib/types/extended.ts - Extended types for UI components
import type { Player, Team, Coach, ScheduleEvent } from './database';

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