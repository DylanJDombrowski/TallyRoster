// lib/services/database.ts - Centralized database operations
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type DatabaseClient = SupabaseClient<Database>;

/**
 * Get authenticated Supabase client for server-side operations
 */
export async function getServerClient(): Promise<DatabaseClient> {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/**
 * Get current user from authenticated session
 */
export async function getCurrentUser() {
  const supabase = await getServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(`Failed to get current user: ${error.message}`);
  }
  
  return user;
}

/**
 * Get user's organization roles
 */
export async function getUserOrganizationRoles(userId: string) {
  const supabase = await getServerClient();
  
  const { data, error } = await supabase
    .from('user_organization_roles')
    .select(`
      organization_id,
      role,
      organizations (
        id, name, subdomain, primary_color, secondary_color
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to get user organization roles: ${error.message}`);
  }

  return data;
}

/**
 * Get current user's organization context
 */
export async function getCurrentUserOrganization() {
  const user = await getCurrentUser();
  if (!user) return null;

  const roles = await getUserOrganizationRoles(user.id);
  if (!roles || roles.length === 0) return null;

  // For now, return the first organization
  // TODO: Support multiple organizations and context switching
  return {
    user,
    organization: roles[0].organizations,
    role: roles[0].role
  };
}