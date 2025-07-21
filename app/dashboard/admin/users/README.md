# User Management

The User Management feature enables administrators to invite new users to their organization, assign roles, and manage user permissions. This module provides comprehensive user lifecycle management with team assignments and role-based access control.

## Overview

User management is a critical administrative function that controls who has access to the organization's data and what level of permissions they have. This system supports invitation-based user onboarding and role management.

**Location**: `/app/dashboard/admin/users/`

**Access Level**: Admin only

## Core Features

### 👤 User Invitation System
- Email-based user invitations
- Role assignment during invitation
- Team assignment for coaches
- Automated onboarding workflow

### 🔑 Role Management
- **Admin**: Full organizational access
- **Coach**: Team-specific access
- **Staff**: Limited access based on configuration
- **Custom Roles**: Extensible role system

### 👥 User Directory
- View all organization users
- Edit user roles and assignments
- Monitor user status and activity
- Team-based user organization

### 🏆 Team Assignments
- Assign coaches to specific teams
- Multi-team support for users
- Team-based permission scoping
- Coach rotation management

## Technical Architecture

### Main Components

#### `UserManagementPage` (`page.tsx`)
The main page component that orchestrates user management:
- Client-side component for modal state management
- Fetches and displays current users
- Manages user editing workflow
- Integrates invitation and editing forms

```typescript
type UserWithRole = User & {
  role: string;
  team_id: string | null;
  team_name: string | null;
};
```

#### `InviteUserForm` (`components/invite-user-form.tsx`)
Handles new user invitations:
- Email validation and invitation sending
- Role selection interface
- Team assignment for coaches
- Integration with Supabase Auth

```typescript
interface InviteUserFormProps {
  teams: Team[];
}
```

#### `EditUserForm` (`components/edit-user-form.tsx`)
Manages existing user modifications:
- Role change functionality
- Team reassignment
- User status management
- Permission validation

```typescript
interface EditableUser {
  id: string;
  email: string;
  role: string;
  team_id: string | null;
}
```

### Server Actions (`actions.ts`)

#### `inviteUser(formData: FormData)`
Sends user invitations with role assignment:
- Validates administrator permissions
- Creates invitation with metadata
- Sends invitation email
- Tracks invitation status

#### `updateUserRole(userId: string, role: string, teamId?: string)`
Updates user roles and assignments:
- Validates permission to modify users
- Updates role in user_organization_roles table
- Handles team assignment changes
- Maintains audit trail

### Data Model

User management involves several interconnected tables:

#### `user_organization_roles`
```typescript
interface UserOrganizationRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'admin' | 'coach' | 'staff';
  team_id?: string;
  created_at: string;
  updated_at: string;
}
```

#### `invitations`
```typescript
interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  team_id?: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
}
```

## Security & Access Control

### Administrator Only Access
Strict role verification for all user management operations:
```typescript
const { data: userOrgRole } = await supabase
  .from("user_organization_roles")
  .select("role")
  .eq("user_id", user.id)
  .single();

if (userOrgRole?.role !== "admin") {
  return { error: "Not authorized to manage users" };
}
```

### Organization Scoping
All user operations are scoped to the administrator's organization:
```typescript
// Only invite users to current organization
const invitationData = {
  organization_id: userOrgRole.organization_id,
  email,
  role,
  team_id,
  invited_by: user.id
};
```

### Permission Validation
- **Self-Protection**: Admins cannot remove their own admin status
- **Role Hierarchy**: Proper role assignment validation
- **Team Scope**: Team assignments validated against organization teams

## Usage Patterns

### Inviting a New User
1. Navigate to `/dashboard/admin/users`
2. Fill out invitation form:
   - Email address (required)
   - Role selection (admin, coach, staff)
   - Team assignment (if coach role)
3. Send invitation
4. User receives email with onboarding link

### Managing Existing Users
1. View current users in the user directory
2. Click "Edit" on any user
3. Modify role or team assignment
4. Save changes with automatic validation

### Role Assignment Best Practices
- **Admins**: Limit to trusted organizational leaders
- **Coaches**: Assign to specific teams they manage
- **Staff**: Use for support personnel with limited access
- **Team Assignments**: Ensure coaches have appropriate team access

## Integration Points

### Authentication System
- **Supabase Auth**: Core authentication provider
- **Invitation Flow**: Automated user onboarding
- **Session Management**: Organization context maintenance

### Team Management
- **Coach Assignment**: Link coaches to teams they manage
- **Permission Scoping**: Team-based access control
- **Multi-Team Support**: Users can be assigned to multiple teams

### Communications
- **Invitation Emails**: Automated invitation delivery
- **Welcome Messages**: Onboarding communication
- **Role Notifications**: Permission change alerts

### Audit & Compliance
- **Change Tracking**: Log all role modifications
- **Access Monitoring**: Track user access patterns
- **Compliance Reporting**: Generate user access reports

## Performance Considerations

### Optimization Strategies
- **Client-Side Caching**: User data cached for quick access
- **Lazy Loading**: Load user details on demand
- **Batch Operations**: Efficient bulk user operations
- **Real-Time Updates**: Live user status updates

### Scalability
- **Pagination**: Support for large user bases
- **Search Functionality**: Quick user discovery
- **Filtering**: Role and team-based user filtering
- **Export Capabilities**: User data export features

## Development Guidelines

### Adding New Roles
1. Update role enum in TypeScript interfaces
2. Add role to database constraints
3. Update permission checking logic
4. Modify UI role selection components
5. Update documentation

### Testing User Management
- **Permission Boundary Testing**: Verify access controls
- **Invitation Flow Testing**: Complete onboarding workflow
- **Role Change Testing**: Validate permission updates
- **Organization Isolation**: Ensure multi-tenant security

## Future Enhancements

### Planned Features
- **Advanced Permission System**: Granular permission control
- **User Groups**: Organize users into functional groups
- **Bulk User Operations**: Mass invitation and role updates
- **User Analytics**: Track user engagement and activity
- **Integration APIs**: External user system connections

### Technical Improvements
- **Real-Time User Status**: Live online/offline indicators
- **Enhanced Search**: Full-text user search capabilities
- **Mobile Optimization**: Improved mobile user management
- **Audit Dashboard**: Comprehensive user activity tracking
- **Automated Role Suggestions**: AI-powered role recommendations

## Troubleshooting

### Common Issues
- **Invitation Not Received**: Check email delivery and spam filters
- **Permission Denied**: Verify admin role and organization membership
- **Team Assignment Errors**: Validate team exists and belongs to organization
- **Role Update Failures**: Check for self-modification attempts

### Debug Information
- Monitor invitation email delivery
- Check user role assignment in database
- Validate organization ID scoping
- Review error handling and user feedback

## Related Documentation
- [Team Management](./teams/README.md) - Team creation and coach assignment
- [Admin Overview](./README.md) - General admin feature information
- [Dashboard Home](../README.md) - Main dashboard functionality