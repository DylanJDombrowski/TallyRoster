// lib/types/auth.ts - Authentication and organization types
import type { Organization } from './database';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'coach' | 'member';

export type UserOrganizationContext = {
  user: User;
  organization: Organization;
  role: UserRole;
};

export type OrganizationMembership = {
  id: string;
  name: string;
  role: UserRole;
};