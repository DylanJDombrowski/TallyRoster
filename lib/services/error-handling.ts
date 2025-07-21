// lib/services/error-handling.ts - Centralized error handling
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './validation';

/**
 * Wrap server actions with consistent error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  action: (...args: T) => Promise<ActionResult<R>>,
  options?: {
    revalidatePaths?: string[];
    successMessage?: string;
  }
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      const result = await action(...args);
      
      if (result.success && options?.revalidatePaths) {
        options.revalidatePaths.forEach(path => revalidatePath(path));
      }
      
      if (result.success && options?.successMessage) {
        return { ...result, message: options.successMessage };
      }
      
      return result;
    } catch (error) {
      console.error('Server action error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };
}

/**
 * Database error handler
 */
export function handleDatabaseError(error: unknown): ActionResult<never> {
  console.error('Database error:', error);
  
  if (error && typeof error === 'object' && 'message' in error) {
    return { 
      success: false, 
      error: `Database operation failed: ${error.message}` 
    };
  }
  
  return { 
    success: false, 
    error: 'Database operation failed' 
  };
}

/**
 * Authentication error handler
 */
export function handleAuthError(error: unknown): ActionResult<never> {
  console.error('Authentication error:', error);
  
  return { 
    success: false, 
    error: 'Authentication required or invalid' 
  };
}