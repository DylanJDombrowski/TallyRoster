# TallyRoster Developer Guide

This comprehensive guide covers the technical architecture, development practices, and guidelines for contributing to the TallyRoster platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Development Setup](#development-setup)
5. [Coding Standards](#coding-standards)
6. [Database Design](#database-design)
7. [Security Practices](#security-practices)
8. [API Patterns](#api-patterns)
9. [Testing Guidelines](#testing-guidelines)
10. [Deployment Process](#deployment-process)

## Architecture Overview

TallyRoster is built as a modern, multi-tenant sports organization management platform using Next.js 15 with the App Router architecture pattern.

### Core Principles

- **Multi-Tenant Architecture**: Each organization operates in complete isolation
- **Role-Based Access Control**: Granular permissions based on user roles
- **Real-Time Capabilities**: Live updates using Supabase real-time subscriptions
- **Mobile-First Design**: Responsive design with mobile optimization
- **Type Safety**: Full TypeScript implementation throughout

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │────│   Supabase DB   │────│   External APIs │
│   (Frontend)    │    │   (Backend)     │    │   (Services)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ├─ Authentication        ├─ Row Level Security   ├─ Cloudinary
        ├─ Server Components     ├─ Real-time Updates   ├─ Email Service
        ├─ Server Actions        ├─ Database Functions  ├─ SMS Gateway
        └─ Static Generation     └─ Edge Functions      └─ Analytics
```

## Technology Stack

### Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React, Heroicons
- **Forms**: React Hook Form with Zod validation

### External Services
- **Image Storage**: Cloudinary
- **Email**: Supabase Email (with SMTP fallback)
- **SMS**: Web Push API integration
- **Analytics**: Built-in (with third-party integration ready)

### Development Tools
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier (configured)
- **Package Manager**: npm
- **Version Control**: Git with conventional commits

## Project Structure

```
TallyRoster/
├── app/                          # Next.js App Router pages
│   ├── dashboard/                # Main application dashboard
│   │   ├── admin/               # Admin-only features
│   │   ├── players/             # Player management
│   │   ├── communications/      # Messaging system
│   │   ├── games/               # Game management
│   │   └── site-customizer/     # Website customization
│   ├── sites/[subdomain]/       # Multi-tenant public sites
│   ├── auth/                    # Authentication flows
│   ├── marketing/               # Marketing pages
│   └── api/                     # API routes
├── components/                   # Shared React components
├── lib/                         # Utility libraries and services
│   ├── supabase/               # Database client configuration
│   ├── types.ts                # TypeScript type definitions
│   └── utils/                  # Utility functions
├── context/                     # React context providers
├── middleware.ts                # Next.js middleware
├── public/                      # Static assets
└── supabase/                    # Database schema and migrations
```

### Feature Organization

Each major feature follows a consistent structure:

```
feature/
├── page.tsx                     # Main page component
├── layout.tsx                   # Feature-specific layout (if needed)
├── actions.ts                   # Server actions
├── components/                  # Feature-specific components
│   ├── feature-manager.tsx     # Main orchestrator component
│   ├── feature-form.tsx        # Create/edit forms
│   ├── feature-list.tsx        # List/display components
│   └── ...                     # Additional components
└── README.md                    # Feature documentation
```

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase CLI (for database management)
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/DylanJDombrowski/TallyRoster.git
cd TallyRoster
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. Start development server:
```bash
npm run dev
```

### Database Setup

1. Initialize Supabase locally (optional):
```bash
supabase init
supabase start
```

2. Apply migrations:
```bash
supabase db reset
```

3. Seed test data (if available):
```bash
npm run seed
```

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Prefer type unions over enums where appropriate
- Use generic types for reusable components

```typescript
// Good: Explicit interface definition
interface PlayerFormProps {
  player?: Player;
  teams: Team[];
  onSave: (player: Player) => void;
  onCancel: () => void;
}

// Good: Generic component
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
}
```

### React Patterns

#### Server Components (Default)
Use Server Components for data fetching and initial rendering:

```typescript
export default async function PlayersPage() {
  const supabase = createClient(await cookies());
  const { data: players } = await supabase.from("players").select("*");
  
  return <PlayerManager initialPlayers={players || []} />;
}
```

#### Client Components (When Needed)
Use Client Components for interactivity:

```typescript
"use client";

export function PlayerForm({ player, onSave }: PlayerFormProps) {
  const [formData, setFormData] = useState(player || {});
  // Interactive form logic
}
```

#### Server Actions
Use Server Actions for mutations:

```typescript
"use server";

export async function createPlayer(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // Validation
  const validatedFields = PlayerSchema.safeParse({
    name: formData.get("name"),
    // ... other fields
  });
  
  if (!validatedFields.success) {
    return { error: "Invalid data" };
  }
  
  // Database operation
  const { error } = await supabase
    .from("players")
    .insert(validatedFields.data);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/dashboard/players");
  return { success: true };
}
```

### Styling Guidelines

- Use Tailwind CSS utility classes
- Create component variants using conditional classes
- Use CSS variables for dynamic theming
- Maintain consistent spacing and typography scales

```typescript
// Good: Conditional styling with variants
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

function Button({ variant = "primary", children, ...props }) {
  return (
    <button 
      className={`px-4 py-2 rounded-md font-medium transition-colors ${buttonVariants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Database Design

### Multi-Tenant Architecture

All data tables include `organization_id` for tenant isolation:

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  -- other fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their organization's players" 
ON players FOR ALL 
USING (organization_id IN (
  SELECT organization_id 
  FROM user_organization_roles 
  WHERE user_id = auth.uid()
));
```

### Key Tables

#### Core Identity
- `organizations` - Tenant organizations
- `users` - User accounts (via Supabase Auth)
- `user_organization_roles` - User-organization-role mappings

#### Sports Data
- `teams` - Organization teams
- `players` - Team rosters
- `games` - Game schedules and results
- `coaches` - Coaching staff

#### Communication
- `communications` - Messages and announcements
- `communication_deliveries` - Delivery tracking
- `communication_groups` - Recipient groups

#### Customization
- `custom_links` - Site navigation links
- `blog_posts` - Organization content

### Database Conventions

- Use UUID primary keys for all entities
- Include `created_at` and `updated_at` timestamps
- Use snake_case for column names
- Implement soft deletes where appropriate
- Foreign key constraints for data integrity

## Security Practices

### Authentication & Authorization

#### Row-Level Security (RLS)
All sensitive tables have RLS policies:

```sql
-- Example: Team access policy
CREATE POLICY "team_access_policy" ON teams 
FOR ALL USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organization_roles 
    WHERE user_id = auth.uid()
  )
);
```

#### Role-Based Access Control
Implement role checks in Server Components:

```typescript
async function AdminOnlyComponent() {
  const { data: userRole } = await supabase
    .from("user_organization_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
    
  if (userRole?.role !== "admin") {
    return <AccessDenied />;
  }
  
  return <AdminContent />;
}
```

### Input Validation

#### Server-Side Validation
Always validate on the server using Zod:

```typescript
const PlayerSchema = z.object({
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  email: z.string().email().optional(),
  team_id: z.string().uuid().optional(),
});

export async function createPlayer(formData: FormData) {
  const validatedFields = PlayerSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    // ...
  });
  
  if (!validatedFields.success) {
    return { 
      error: "Validation failed", 
      fields: validatedFields.error.flatten().fieldErrors 
    };
  }
  
  // Proceed with validated data
}
```

#### Client-Side Validation
Use React Hook Form with Zod resolver:

```typescript
const form = useForm<PlayerFormData>({
  resolver: zodResolver(PlayerSchema),
  defaultValues: player || {},
});
```

### Security Headers

Configure security headers in `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## API Patterns

### Server Actions Pattern

Server Actions are the primary way to handle mutations:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTeam(prevState: any, formData: FormData) {
  // 1. Authentication check
  const user = await getUser();
  if (!user) redirect("/login");
  
  // 2. Authorization check
  const isAdmin = await checkAdminRole(user.id);
  if (!isAdmin) return { error: "Unauthorized" };
  
  // 3. Validation
  const validatedFields = TeamSchema.safeParse({
    name: formData.get("name"),
    // ...
  });
  
  if (!validatedFields.success) {
    return { error: "Invalid data", fields: validatedFields.error.flatten() };
  }
  
  // 4. Database operation
  const { error } = await supabase
    .from("teams")
    .insert(validatedFields.data);
    
  if (error) {
    return { error: error.message };
  }
  
  // 5. Revalidation and redirect
  revalidatePath("/dashboard/admin/teams");
  return { success: true };
}
```

### API Route Pattern

For external integrations or complex operations:

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle event
    await handleStripeEvent(event);
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
```

## Testing Guidelines

### Unit Testing

Test utility functions and components:

```typescript
// lib/__tests__/utils.test.ts
import { formatPlayerName } from "../utils";

describe("formatPlayerName", () => {
  it("should format player name correctly", () => {
    const player = { first_name: "John", last_name: "Doe" };
    expect(formatPlayerName(player)).toBe("John Doe");
  });
  
  it("should handle missing names", () => {
    const player = { first_name: "", last_name: "Doe" };
    expect(formatPlayerName(player)).toBe("Doe");
  });
});
```

### Integration Testing

Test complete workflows:

```typescript
// __tests__/player-management.test.ts
import { createPlayer } from "@/app/dashboard/players/actions";

describe("Player Management", () => {
  it("should create a player successfully", async () => {
    const formData = new FormData();
    formData.append("first_name", "Test");
    formData.append("last_name", "Player");
    
    const result = await createPlayer(formData);
    expect(result.success).toBe(true);
  });
  
  it("should reject invalid data", async () => {
    const formData = new FormData();
    // Missing required fields
    
    const result = await createPlayer(formData);
    expect(result.error).toBeDefined();
  });
});
```

### Manual Testing Checklist

For each feature:
- [ ] Authentication and authorization
- [ ] Multi-tenant data isolation
- [ ] Form validation (client and server)
- [ ] Error handling and user feedback
- [ ] Mobile responsiveness
- [ ] Performance with large datasets
- [ ] Real-time updates (if applicable)

## Deployment Process

### Environment Configuration

#### Production Environment Variables
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_anon_key
SUPABASE_SERVICE_ROLE_KEY=production_service_key

# External Services
CLOUDINARY_CLOUD_NAME=production_cloud
CLOUDINARY_API_KEY=production_key
CLOUDINARY_API_SECRET=production_secret

# Security
NEXTAUTH_SECRET=secure_random_string
NEXTAUTH_URL=https://yourdomain.com
```

#### Build Configuration
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Database Migration Process

1. **Development**: Test migrations locally
2. **Staging**: Apply migrations to staging environment
3. **Production**: Apply migrations during maintenance window

```bash
# Apply migrations
supabase db push

# Backup before major changes
supabase db dump > backup-$(date +%Y%m%d).sql
```

### Monitoring and Observability

#### Performance Monitoring
- Monitor Core Web Vitals
- Track API response times
- Monitor database query performance
- Set up error tracking (Sentry or similar)

#### Health Checks
- Database connectivity
- External service availability
- Authentication service status
- File upload service status

### Backup Strategy

#### Database Backups
- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup storage
- Regular backup restoration testing

#### Asset Backups
- Cloudinary automatic backups
- Local asset synchronization
- Version control for code assets

## Best Practices Summary

### Code Quality
- Use TypeScript strictly
- Implement comprehensive error handling
- Write self-documenting code
- Follow consistent naming conventions

### Security
- Never trust client-side data
- Implement proper authentication/authorization
- Use RLS for data isolation
- Validate all inputs server-side

### Performance
- Optimize database queries
- Use appropriate caching strategies
- Implement lazy loading where appropriate
- Monitor and optimize bundle sizes

### Maintainability
- Document complex business logic
- Use consistent code patterns
- Implement proper logging
- Keep dependencies up to date

## Contributing

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation as needed
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval and CI passes

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests cover new functionality
- [ ] Security considerations addressed
- [ ] Performance impact evaluated
- [ ] Documentation updated
- [ ] Breaking changes documented

For additional questions or clarifications, refer to the individual feature documentation or reach out to the development team.