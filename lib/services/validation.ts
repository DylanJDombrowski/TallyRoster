// lib/services/validation.ts - Centralized validation utilities
import { z } from 'zod';

/**
 * Standard API response types
 */
export type ActionResult<T = unknown> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown };

/**
 * Validate form data against a Zod schema
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData
): ActionResult<T> {
  try {
    const data = schema.parse(Object.fromEntries(formData));
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { 
        success: false, 
        error: 'Validation failed', 
        details 
      };
    }
    return { 
      success: false, 
      error: 'Unknown validation error' 
    };
  }
}

/**
 * Validate and parse JSON data
 */
export function validateJson<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ActionResult<T> {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { 
        success: false, 
        error: 'Validation failed', 
        details 
      };
    }
    return { 
      success: false, 
      error: 'Invalid JSON data' 
    };
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  positiveInt: z.coerce.number().int().positive('Must be a positive integer'),
  email: z.string().email('Invalid email address'),
  nonEmptyString: z.string().min(1, 'Field is required'),
  optionalString: z.string().optional(),
} as const;