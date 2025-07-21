// lib/schemas/player.ts - Player-related validation schemas
import { z } from 'zod';

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

export const PlayerStatusSchema = z.object({
  playerId: z.string().uuid(),
  status: z.enum(["active", "archived"]),
});

export type PlayerFormData = z.infer<typeof PlayerFormSchema>;
export type PlayerStatusData = z.infer<typeof PlayerStatusSchema>;