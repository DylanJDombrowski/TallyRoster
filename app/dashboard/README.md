# TallyRoster Dashboard

The TallyRoster dashboard is the central hub for managing sports organizations, teams, players, and communications. Built with Next.js 15 and Supabase, it provides a comprehensive multi-tenant platform for sports team management.

## Overview

The dashboard provides different functionality based on user roles:
- **Admin**: Full access to all features including team management, user management, and site customization
- **Coach**: Access to player management, communications, and games
- **Staff**: Limited access based on organization configuration

## Core Features

### 📊 Dashboard Home (`/dashboard`)
- Organization overview with key statistics
- Quick action cards for common tasks
- Recent activity feed
- Role-based quick actions

**Components:**
- Real-time stats (teams, active players, recent posts)
- Dynamic quick actions based on user role
- Organization branding integration

### 👥 Player Management (`/dashboard/players`)
- Complete player roster management
- Player profile creation and editing
- Image upload and management
- Team assignment
- Status tracking (active/inactive)
- Bulk import functionality

### 🏆 Team Management (`/dashboard/admin/teams`) - Admin Only
- Create and manage teams
- Team hierarchy and organization
- Coach assignment
- Team-specific settings

### 👤 User Management (`/dashboard/admin/users`) - Admin Only  
- Invite new users to organization
- Manage user roles and permissions
- Edit user profiles
- Role-based access control

### 📢 Communications (`/dashboard/communications`)
- Send messages to teams, groups, or individuals
- Multiple delivery channels (email, SMS, push notifications)
- Delivery analytics and tracking
- Message templates and history
- Audience targeting

### 🎮 Games Management (`/dashboard/games`)
- Schedule management
- Game creation and editing
- Score tracking
- Live scoreboard integration

### 🎨 Site Customizer (`/dashboard/site-customizer`) - Admin Only
- Organization branding (colors, logos)
- Custom links and navigation
- Content management
- Public site preview

## Architecture

### Multi-Tenant Design
- Each organization operates in isolation
- Row-level security (RLS) enforces data separation
- Organization-scoped queries throughout the application

### Authentication & Authorization
- Supabase Auth integration
- Role-based access control
- Organization membership verification
- Session management

### Data Flow
1. User authentication via Supabase Auth
2. Organization role lookup
3. Data queries scoped to user's organization
4. Role-based UI rendering

## Technical Details

### Layout Structure
- **Layout** (`layout.tsx`): Provides authentication, organization context, and navigation
- **Sidebar Navigation**: Role-based menu rendering
- **Theme Integration**: Dynamic organization branding
- **Organization Switcher**: For users with multiple organization access

### Key Dependencies
- **Supabase**: Database, authentication, real-time subscriptions
- **Next.js 15**: App Router, Server Components, Server Actions
- **TypeScript**: Full type safety
- **Tailwind CSS**: Styling and responsive design
- **Framer Motion**: Animations and transitions

### Security Features
- Row-level security on all database tables
- Organization-scoped data access
- Role-based route protection
- Input validation and sanitization

## Development

### Getting Started
1. Ensure environment variables are configured
2. Run `npm install` to install dependencies
3. Start development server with `npm run dev`
4. Access dashboard at `http://localhost:3000/dashboard`

### Adding New Features
1. Create feature folder in `/app/dashboard/[feature]/`
2. Implement page component with proper authentication
3. Add server actions if needed
4. Update sidebar navigation in `components/sidebar-nav.tsx`
5. Add role-based access control

### Testing
- Manual testing in development environment
- Role-based feature testing
- Multi-tenant isolation verification

## Common Patterns

### Server Component with Authentication
```typescript
export default async function FeaturePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  
  const { data: orgRole } = await supabase
    .from("user_organization_roles")
    .select("organization_id, role")
    .eq("user_id", session.user.id)
    .single();
    
  // Feature implementation...
}
```

### Organization-Scoped Queries
```typescript
const { data } = await supabase
  .from("table_name")
  .select("*")
  .eq("organization_id", organizationId);
```

## Future Enhancements

Based on the existing refactoring guide, planned improvements include:
- Centralized action layer (`lib/actions/`)
- Improved type organization
- Service layer abstraction
- Component library organization
- Enhanced error handling

See [REFACTORING_GUIDE.md](../../REFACTORING_GUIDE.md) for detailed improvement plans.