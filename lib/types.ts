// lib/types.ts
import { z } from "zod";
import { Database } from "./database.types"; // Your newly created types file

// Form schema for creating/editing a player using Zod
export const PlayerFormSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(2, "First name must be at least 2 characters."),
  last_name: z.string().min(2, "Last name must be at least 2 characters."),
  jersey_number: z.coerce.number().int().positive("Jersey must be a positive number.").nullable(),
  position: z.string().nullable(),
  team_id: z.string().uuid("You must select a team."),
  headshot_url: z.string().url().nullable(),
});

// NEW: Form schema for creating/editing a team
export const TeamFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Team name must be at least 3 characters."),
  season: z.string().min(4, "Season must be at least 4 characters.").nullable(),
});

// Infer the TypeScript type from the Zod schema
export type PlayerFormData = z.infer<typeof PlayerFormSchema>;
export type TeamFormData = z.infer<typeof TeamFormSchema>;

// Extract Player and Team types from the auto-generated file for easier use
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
