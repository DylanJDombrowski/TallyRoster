// lib/schemas/team.ts - Team-related validation schemas
import { z } from 'zod';

export const TeamFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Team name must be at least 3 characters."),
  season: z.string().min(1, "Season is required."),
  year: z.coerce.number().int().min(2020).max(2035).nullable(),
  team_image_url: z.string().url().nullable().optional(),
  primary_color: z.string().default("#161659"),
  secondary_color: z.string().default("#BD1515"),
});

export type TeamFormData = z.infer<typeof TeamFormSchema>;