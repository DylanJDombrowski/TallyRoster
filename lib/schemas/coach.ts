// lib/schemas/coach.ts - Coach-related validation schemas
import { z } from 'zod';

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

export type CoachFormData = z.infer<typeof CoachFormSchema>;