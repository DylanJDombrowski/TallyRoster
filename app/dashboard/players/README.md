# Player Management

The Player Management feature provides comprehensive tools for managing sports team rosters within the TallyRoster platform. This module handles player profiles, team assignments, status tracking, and bulk import capabilities.

## Overview

The player management system is designed around a central `PlayerManager` component that orchestrates all player-related operations. It provides real-time updates, search functionality, and role-based access controls.

**Location**: `/app/dashboard/players/`

**Access Level**: All authenticated users (coaches, admins, staff)

## Core Features

### 🔍 Player Search & Filtering
- Real-time search across player names
- Filter by team assignment
- Status-based filtering (active/archived)
- Sort by various criteria

### 👤 Player Profile Management
- Complete player information (name, contact, position, etc.)
- Profile image upload with Cloudinary integration
- Custom fields for sport-specific data
- Team assignment and history

### 📊 Status Tracking
- **Active**: Currently playing members
- **Archived**: Former players, inactive members
- Status change tracking and history

### 📤 Bulk Import
- CSV file upload for multiple players
- Data validation and error handling
- Preview before import confirmation
- Support for standard roster formats

### 🏆 Team Integration
- Assign players to multiple teams
- Team-based player lists
- Coach access controls per team

## Technical Architecture

### Main Components

#### `PlayerManager` (`components/player-manager.tsx`)
The central orchestrator component that manages:
- Player list state and updates
- Search and filtering logic
- Modal state management
- Real-time data synchronization

```typescript
interface PlayerManagerProps {
  initialPlayers: Player[];
  teams: Team[];
  organizationId: string;
}
```

#### `PlayerList` (`components/player-list.tsx`)
Displays the player roster with:
- Responsive grid/list layout
- Player cards with essential information
- Quick action buttons (edit, archive, delete)
- Pagination and infinite scroll

#### `PlayerForm` (`components/player-form.tsx`)
Handles player creation and editing:
- Form validation with Zod schemas
- Image upload integration
- Team assignment selection
- Real-time form state management

#### `ImageUploader` (`components/image-uploader.tsx`)
Dedicated component for profile pictures:
- Drag-and-drop file upload
- Image preview and cropping
- Cloudinary integration
- Error handling and progress indication

#### `PlayerImporter` (`components/player-importer.tsx`)
Bulk import functionality:
- CSV file parsing with Papa Parse
- Data validation and preview
- Error reporting and correction
- Batch creation with progress tracking

### Server Actions (`actions.ts`)

The module includes several server actions for data operations:

#### `updatePlayerStatus(formData: FormData)`
Changes player status between active and archived:
```typescript
const PlayerStatusSchema = z.object({
  playerId: z.string().uuid(),
  status: z.enum(["active", "archived"]),
});
```

#### `deletePlayer(playerId: string)`
Permanently removes a player from the system:
- Soft delete preferred in production
- Cascading relationship handling
- Activity logging

### Data Model

Players are stored with the following key fields:
```typescript
interface Player {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  jersey_number?: number;
  status: 'active' | 'archived';
  image_url?: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
}
```

## Security & Access Control

### Multi-Tenant Isolation
- All queries scoped to user's organization
- Row-level security (RLS) policies enforced
- Organization ID validation on all operations

### Role-Based Permissions
- **Admin**: Full CRUD access to all players
- **Coach**: Access to assigned team players
- **Staff**: Read-only access based on organization settings

### Data Validation
- Server-side validation with Zod schemas
- Input sanitization and type checking
- File upload security (image validation)

## Usage Patterns

### Adding a New Player
1. Navigate to `/dashboard/players`
2. Click "Add Player" button
3. Fill out player information form
4. Upload profile image (optional)
5. Assign to team(s)
6. Save and confirm

### Bulk Import Process
1. Prepare CSV file with required columns
2. Access "Import Players" feature
3. Upload and preview data
4. Review validation errors
5. Confirm import operation
6. Monitor import progress

### Player Status Management
- Use quick actions in player list
- Archive players instead of deleting
- Maintain historical records
- Support for re-activation

## Integration Points

### Image Management
- **Cloudinary**: Profile image storage and optimization
- **Upload API**: Secure signed upload URLs
- **Image Processing**: Automatic resizing and optimization

### Team Management
- **Team Assignment**: Multi-team support
- **Coach Permissions**: Team-based access control
- **Roster Limits**: Configurable team size limits

### Communications
- **Player Contact**: Email and phone integration
- **Message Targeting**: Send to specific players or teams
- **Notification Preferences**: Individual player settings

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components load on demand
- **Pagination**: Large roster support
- **Search Debouncing**: Efficient search queries
- **Image Optimization**: Cloudinary transformations

### Caching
- **Next.js Caching**: Automatic page and data caching
- **Revalidation**: Smart cache invalidation
- **Optimistic Updates**: Immediate UI feedback

## Development Guidelines

### Adding New Fields
1. Update database schema
2. Modify TypeScript interfaces
3. Update form components
4. Add validation rules
5. Update import/export logic

### Testing Considerations
- Multi-tenant data isolation
- File upload functionality
- Form validation edge cases
- Bulk import error handling
- Permission boundary testing

## Future Enhancements

### Planned Features
- **Advanced Statistics**: Performance tracking
- **Medical Records**: Injury and health management
- **Parent Portal**: Family access and communication
- **Mobile App**: Native mobile interface
- **API Integration**: Third-party roster systems

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Progressive Web App features
- **Enhanced Search**: Full-text search capabilities
- **Audit Trail**: Complete change history
- **Export Options**: Multiple format support

## Troubleshooting

### Common Issues
- **Upload Failures**: Check Cloudinary configuration
- **Import Errors**: Validate CSV format and data types
- **Permission Denied**: Verify user role and organization membership
- **Slow Loading**: Review query optimization and caching

### Debug Information
- Enable detailed logging in development
- Monitor Supabase real-time subscriptions
- Check network requests for API calls
- Validate form state and error handling