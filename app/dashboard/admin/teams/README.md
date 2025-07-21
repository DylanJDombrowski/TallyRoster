# Team Management

The Team Management feature allows administrators to create, organize, and manage teams within their sports organization. This module provides comprehensive team lifecycle management with support for multiple seasons, branding customization, and hierarchical organization.

## Overview

Team management is a core administrative function that provides the foundation for player assignments, game scheduling, and organizational structure. Only users with administrator privileges can access these features.

**Location**: `/app/dashboard/admin/teams/`

**Access Level**: Admin only

## Core Features

### 🏆 Team Creation & Management
- Create new teams with comprehensive details
- Edit existing team information
- Delete teams (with safeguards for teams with players)
- Duplicate checking to prevent naming conflicts

### 🎨 Team Branding
- Custom team colors (primary and secondary)
- Team logo/image upload
- Visual identity management
- Consistent branding across platform

### 📅 Season & Year Management
- Multi-season support (Fall, Spring, Summer, Winter)
- Year-based organization
- Historical team tracking
- Season transitions and archives

### 👥 Team Roster Integration
- Player assignment and management
- Roster size tracking
- Team-based permissions
- Coach assignments

## Technical Architecture

### Main Components

#### `TeamManager` (`components/team-manager.tsx`)
The central component that orchestrates team management:
- Team list display and management
- Modal state for team creation/editing
- Real-time updates and state synchronization
- Search and filtering capabilities

```typescript
interface TeamManagerProps {
  initialTeams: Team[];
}
```

#### `TeamList` (`components/team-list.tsx`)
Displays the organization's teams:
- Grid layout with team cards
- Quick action buttons (edit, delete)
- Visual team branding display
- Responsive design for all devices

#### `TeamForm` (`components/team-form.tsx`)
Handles team creation and editing:
- Comprehensive form validation
- Color picker integration
- Image upload for team logos
- Duplicate name prevention

```typescript
interface TeamFormProps {
  team?: Team;
  onClose: () => void;
  onSave: () => void;
}
```

### Server Actions (`actions.ts`)

#### `upsertTeam(prevState: unknown, formData: FormData)`
Creates or updates team information:
- Validates user permissions (admin only)
- Checks for duplicate team names
- Handles organization scoping
- Validates form data with Zod schemas

```typescript
const TeamFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Team name is required"),
  season: z.enum(["Fall", "Spring", "Summer", "Winter"]),
  primary_color: z.string(),
  secondary_color: z.string(),
  year: z.string(),
  team_image_url: z.string().nullable(),
});
```

#### `deleteTeam(teamId: string)`
Safely removes teams from the organization:
- Checks for existing players on team
- Handles cascading relationships
- Provides user confirmation
- Audit trail logging

### Data Model

Teams are structured with the following schema:
```typescript
interface Team {
  id: string;
  organization_id: string;
  name: string;
  season: 'Fall' | 'Spring' | 'Summer' | 'Winter';
  year: string;
  primary_color: string;
  secondary_color: string;
  team_image_url?: string;
  created_at: string;
  updated_at: string;
  // Relationships
  players?: Player[];
  coaches?: Coach[];
}
```

## Security & Access Control

### Administrator Only Access
Route-level protection ensures only admins can access team management:
```typescript
if (userOrgRole.role !== "admin") {
  return <p className="p-8">You do not have permission to view this page.</p>;
}
```

### Organization Scoping
All team operations are automatically scoped to the user's organization:
```typescript
const { data: teams } = await supabase
  .from("teams")
  .select("*")
  .eq("organization_id", userOrgRole.organization_id);
```

### Data Validation
- Server-side validation with Zod schemas
- Duplicate name prevention within organization
- Color format validation
- Image URL validation and sanitization

## Usage Patterns

### Creating a New Team
1. Navigate to `/dashboard/admin/teams`
2. Click "Add Team" button
3. Fill out team information:
   - Team name (required, must be unique)
   - Season selection
   - Year designation
   - Primary and secondary colors
   - Team logo/image (optional)
4. Save and confirm creation

### Managing Existing Teams
- **Edit**: Update team information while preserving relationships
- **Delete**: Remove teams (blocked if players are assigned)
- **View Details**: Access team roster and associated data

### Team Organization Best Practices
- Use consistent naming conventions (e.g., "2024 Fall Varsity")
- Maintain clear season/year organization
- Apply consistent branding colors
- Regular cleanup of unused teams

## Integration Points

### Player Management
- **Team Assignment**: Players can be assigned to teams
- **Roster Management**: Team-based player organization
- **Access Control**: Coach permissions per team

### Game Scheduling
- **Team Selection**: Games scheduled between teams
- **Home/Away**: Team-based game locations
- **Statistics**: Team performance tracking

### Communications
- **Team Messaging**: Send messages to entire teams
- **Coach Notifications**: Team-specific communications
- **Parent Updates**: Team-based family notifications

### Site Customization
- **Team Branding**: Colors and logos used in public site
- **Team Pages**: Individual team presentation
- **Navigation**: Team-based site structure

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Teams loaded on demand
- **Caching**: Team data cached for quick access
- **Optimistic Updates**: Immediate UI feedback
- **Batch Operations**: Efficient bulk updates

### Scalability
- **Pagination**: Support for large numbers of teams
- **Search**: Efficient team discovery
- **Filtering**: Season and year-based organization
- **Archives**: Historical team management

## Development Guidelines

### Adding New Team Features
1. Update team data model if needed
2. Modify TypeScript interfaces
3. Update form components and validation
4. Add new server actions
5. Update integration points

### Testing Considerations
- **Permission Testing**: Verify admin-only access
- **Data Isolation**: Ensure organization scoping
- **Validation Testing**: Form and server-side validation
- **Integration Testing**: Player assignment and relationships

## Future Enhancements

### Planned Features
- **Advanced Team Analytics**: Performance metrics and insights
- **Team Templates**: Quick team creation from templates
- **Bulk Operations**: Mass team creation and updates
- **Team Hierarchies**: Division and league organization
- **Season Archives**: Historical team management

### Technical Improvements
- **Real-time Updates**: Live team data synchronization
- **Enhanced Search**: Full-text team search capabilities
- **Audit Trail**: Complete team change history
- **API Integration**: External league system connections
- **Mobile Optimization**: Enhanced mobile team management

## Troubleshooting

### Common Issues
- **Permission Denied**: Verify user has admin role
- **Duplicate Names**: Check for existing team names
- **Image Upload Issues**: Validate image format and size
- **Color Picker Problems**: Ensure valid hex color codes

### Debug Information
- Monitor server action responses
- Check organization ID scoping
- Validate form data submission
- Review error handling and user feedback

## Related Documentation
- [Player Management](../players/README.md) - Team assignment and roster management
- [Admin Overview](./README.md) - General admin feature information
- [User Management](./users/README.md) - Coach assignment and permissions