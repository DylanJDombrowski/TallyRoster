# TallyRoster Refactoring Guide

This document outlines the organizational improvements made to the TallyRoster codebase.

## New Directory Structure

### `/lib` Directory Organization

```
lib/
├── actions/           # Server actions (centralized)
│   ├── index.ts      # Barrel export
│   └── players.ts    # Player-specific actions
├── services/         # Business logic and utilities
│   ├── index.ts      # Barrel export
│   ├── database.ts   # Database operations
│   ├── validation.ts # Form validation utilities
│   └── error-handling.ts # Error handling utilities
├── schemas/          # Zod validation schemas
│   ├── index.ts      # Barrel export
│   ├── player.ts     # Player schemas
│   ├── team.ts       # Team schemas
│   ├── coach.ts      # Coach schemas
│   └── schedule.ts   # Schedule schemas
├── types/            # TypeScript type definitions
│   ├── index.ts      # Barrel export
│   ├── database.ts   # Database-derived types
│   ├── extended.ts   # Extended UI types
│   └── auth.ts       # Authentication types
├── utils/            # Utility functions
│   ├── images.ts     # Image handling utilities
│   └── theme.ts      # Theme utilities (existing)
└── config/           # Configuration files
    ├── index.ts      # Barrel export
    ├── app.ts        # Application config
    └── domains.ts    # Domain config (existing)
```

### `/components` Directory Organization

```
components/
├── ui/               # Reusable UI components
├── forms/            # Form components
├── layouts/          # Layout components
└── features/         # Feature-specific components
    ├── players/      # Player-related components
    ├── teams/        # Team-related components
    └── coaches/      # Coach-related components
```

## Key Improvements

### 1. Centralized Actions
- All server actions moved to `lib/actions/`
- Consistent error handling with `withErrorHandling` wrapper
- Standardized validation using `validateFormData`
- Automatic path revalidation

### 2. Better Type Organization
- Split large `lib/types.ts` (130 lines) into focused files
- Separated schemas from types
- Added barrel exports for clean imports

### 3. Improved Services Layer
- `lib/services/database.ts` - Centralized database operations
- `lib/services/validation.ts` - Reusable validation utilities
- `lib/services/error-handling.ts` - Consistent error handling

### 4. Configuration Management
- Centralized app configuration in `lib/config/app.ts`
- Environment-specific settings
- Default values and constants

## Migration Path

### Phase 1: New Structure (✅ Completed)
- Created new directory structure
- Added centralized services
- Split types and schemas
- Migrated player actions as example

### Phase 2: Component Migration (Planned)
- Move shared components to root `/components`
- Organize by category (ui, forms, layouts, features)
- Update import paths

### Phase 3: Action Migration (Planned)
- Migrate remaining actions to new structure
- Update components to use new actions
- Remove old action files

### Phase 4: Import Updates (Planned)
- Update all import statements
- Use barrel exports for cleaner imports
- Remove old type file

## Benefits

1. **Better Code Organization**: Clear separation of concerns
2. **Improved Maintainability**: Easier to find and modify code
3. **Consistent Error Handling**: Standardized patterns across actions
4. **Better Type Safety**: More focused, domain-specific types
5. **Cleaner Imports**: Barrel exports reduce import complexity
6. **Scalability**: Structure supports adding new features easily

## Usage Examples

### Before (Old Structure)
```typescript
import { PlayerFormSchema } from '@/lib/types';
import { updatePlayerStatus } from '@/app/dashboard/players/actions';
```

### After (New Structure)
```typescript
import { PlayerFormSchema } from '@/lib/schemas';
import { updatePlayerStatus } from '@/lib/actions';
```

## Next Steps

1. Gradually migrate remaining actions
2. Move shared components to new structure
3. Update import statements throughout the app
4. Add tests for the new service layer
5. Update documentation