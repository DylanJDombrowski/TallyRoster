// lib/schemas/team.ts - Team-related validation schemas
import { z } from "zod";

export const TeamFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Team name must be at least 3 characters."),
  season: z.string().min(1, "Season is required."),
  year: z.coerce.number().int().min(2020).max(2035).nullable(),
  team_image_url: z.string().url().nullable().optional(),
  primary_color: z.string().default("#161659"),
  secondary_color: z.string().default("#BD1515"),
  // NEW: Coach fields
  coach_name: z
    .string()
    .min(2, "Coach name must be at least 2 characters.")
    .optional(),
  coach_email: z
    .string()
    .email("Please enter a valid email address.")
    .optional(),
  coach_phone: z.string().optional(),
});

export const CoachFormSchema = z.object({
  id: z.string().uuid().optional(),
  team_id: z.string().uuid(),
  name: z.string().min(2, "Coach name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address.").optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
  image_url: z.string().url().optional(),
  order_index: z.number().int().default(0),
});

export type TeamFormData = z.infer<typeof TeamFormSchema>;
export type CoachFormData = z.infer<typeof CoachFormSchema>;
