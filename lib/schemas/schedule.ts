// lib/schemas/schedule.ts - Schedule-related validation schemas
import { z } from 'zod';

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

export type ScheduleEventFormData = z.infer<typeof ScheduleEventFormSchema>;