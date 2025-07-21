# Admin Features

The Admin section provides organization-level management tools exclusively for users with administrator privileges. These features control the fundamental structure and settings of the sports organization.

## Overview

Admin features are restricted to users with the `admin` role and provide comprehensive control over:
- **Team Management**: Create, edit, and organize teams
- **User Management**: Invite users and manage roles
- **Organization Settings**: Configure organization-wide preferences

**Location**: `/app/dashboard/admin/`

**Access Level**: Admin only

## Core Features

### 🏆 Team Management (`/admin/teams`)
Complete team lifecycle management for the organization.

### 👥 User Management (`/admin/users`) 
User invitation, role assignment, and organization access control.

## Security & Access Control

### Route Protection
All admin routes include role verification:
```typescript
// Check if user is admin
if (userOrgRole.role !== "admin") {
  return <p className="p-8">You do not have permission to view this page.</p>;
}
```

### Organization Scoping
All admin operations are scoped to the user's organization:
```typescript
const { data: teams } = await supabase
  .from("teams")
  .select("*")
  .eq("organization_id", userOrgRole.organization_id);
```

## Navigation Integration

Admin features are conditionally displayed in the sidebar navigation based on user role:
```typescript
{userRole === "admin" && (
  <AdminMenuItems />
)}
```

## Future Enhancements

### Planned Admin Features
- **Organization Settings**: Branding, preferences, billing
- **Analytics Dashboard**: Organization-wide insights
- **Audit Logs**: Security and change tracking
- **Integration Management**: Third-party service connections
- **Backup & Export**: Data management tools

## Development Guidelines

### Adding New Admin Features
1. Create feature folder in `/app/dashboard/admin/[feature]/`
2. Implement role-based access control
3. Ensure organization-scoped queries
4. Update sidebar navigation
5. Add appropriate error handling

### Testing Admin Features
- Verify role-based access restrictions
- Test organization data isolation
- Validate permission boundaries
- Check error handling for unauthorized access