// lib/config/app.ts - Application configuration
export const APP_CONFIG = {
  name: 'TallyRoster',
  description: 'The all-in-one platform for youth sports organizations.',
  version: '0.1.0',
  
  // URLs
  urls: {
    base: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  },
  
  // Default theme colors
  theme: {
    primary: '#161659',
    secondary: '#BD1515',
    background: '#ffffff',
  },
  
  // File upload limits
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;