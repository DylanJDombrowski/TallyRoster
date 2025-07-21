// lib/types/database.ts - Database-derived types
import { Database } from '@/lib/database.types';

// Base types from database
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Coach = Database["public"]["Tables"]["coaches"]["Row"];
export type ScheduleEvent = Database["public"]["Tables"]["schedule_events"]["Row"];
export type PlayerStats = Database["public"]["Tables"]["player_stats"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
// Note: 'users' table may not exist in current schema
// export type User = Database["public"]["Tables"]["users"]["Row"];