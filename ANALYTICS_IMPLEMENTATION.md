# Analytics Implementation for TallyRoster

This document describes the comprehensive analytics system implemented for TallyRoster that provides page analytics for each subdomain organization with complete data isolation.

## Features Implemented

### 1. Database Schema
- **New Table**: `analytics_events` with the following structure:
  - `id` (UUID): Primary key
  - `organization_id` (UUID): Foreign key to organizations table
  - `event_type` (TEXT): Type of event (page_view, team_view, player_view, blog_view, etc.)
  - `page_path` (TEXT): The visited page path
  - `page_title` (TEXT): The page title
  - `user_id` (UUID): Optional user ID (null for anonymous visitors)
  - `session_id` (TEXT): Browser session identifier
  - `ip_address` (INET): Visitor IP address
  - `user_agent` (TEXT): Browser user agent
  - `referrer` (TEXT): Referring page
  - `created_at` (TIMESTAMP): Event timestamp
  - `metadata` (JSONB): Additional context data

### 2. Row Level Security (RLS)
- **Complete Data Isolation**: Each organization can only view their own analytics data
- **Permission-Based Access**: Only admins and coaches can view analytics
- **Secure Insertion**: Analytics events can be inserted from any source for tracking

### 3. Analytics Tracking System

#### Client-Side Tracking (`lib/analytics/tracker.ts`)
- **Automatic Page View Tracking**: Tracks all page visits
- **Event-Specific Tracking**: Specialized tracking for:
  - Team page views
  - Player page views
  - Blog post views
  - Navigation clicks
- **Session Management**: Generates unique session IDs for visitor tracking
- **Privacy Conscious**: Gracefully handles errors and doesn't block functionality

#### Server-Side Analytics (`lib/analytics/server.ts`)
- **Aggregated Data Retrieval**: Efficiently fetches analytics summaries
- **Time-Based Filtering**: Supports date range filtering
- **Performance Optimized**: Uses database indexes for fast queries

### 4. Dashboard Integration

#### Navigation Updates
- Added "Analytics" tab to sidebar navigation
- Positioned between Dashboard and Players for logical flow
- Only visible to admins and coaches

#### Analytics Dashboard (`app/dashboard/analytics/`)
- **Summary Cards**: Quick view of key metrics
  - Total views (all time)
  - Monthly views (last 30 days)
  - Weekly views (last 7 days)
  - Today's views
- **Top Pages**: Most visited pages with view counts
- **Top Teams**: Most viewed team pages
- **Top Players**: Most viewed player profiles
- **Views Over Time**: Visual chart showing daily view trends
- **Recent Activity**: Real-time feed of recent page views and interactions

### 5. Subdomain Integration

#### Automatic Tracking
- **Embedded in Layout**: Analytics tracking is automatically added to all subdomain pages
- **Organization Context**: Automatically associates all events with the correct organization
- **Non-Intrusive**: Tracking components render nothing visible to users

#### Page-Specific Tracking
- **Team Pages**: Tracks team views with team metadata
- **Blog Posts**: Tracks blog views with post metadata
- **General Pages**: Tracks all page views with path and title

## File Structure

```
├── app/dashboard/analytics/
│   ├── page.tsx                    # Analytics dashboard page
│   └── components/
│       └── analytics-dashboard.tsx # Dashboard UI components
├── lib/analytics/
│   ├── tracker.ts                  # Client-side tracking utilities
│   └── server.ts                   # Server-side analytics queries
├── components/
│   └── analytics-tracker.tsx       # React component for tracking
├── supabase/migrations/
│   └── add_analytics_tables.sql    # Database schema migration
└── lib/database.types.ts           # Updated with analytics types
```

## Data Isolation & Security

### Organization-Level Isolation
1. **RLS Policies**: Database-level security ensures data isolation
2. **Organization Context**: All queries are scoped to the current organization
3. **Role-Based Access**: Only admins and coaches can view analytics

### Privacy Features
1. **Anonymous Tracking**: User ID is optional for visitor privacy
2. **Session-Based**: Uses session IDs instead of persistent user tracking
3. **Error Handling**: Fails silently to not impact user experience

## Usage Examples

### Viewing Analytics Dashboard
1. Log in as an admin or coach
2. Navigate to Dashboard → Analytics
3. View comprehensive analytics for your organization

### Tracked Events
- **Page Views**: Every page visit on subdomain sites
- **Team Views**: When someone visits a team page
- **Player Views**: When someone views a player profile
- **Blog Views**: When someone reads a blog post

### Data Available
- **Traffic Metrics**: Total views, unique visitors, daily trends
- **Content Performance**: Most popular pages, teams, and players
- **User Behavior**: Recent activity and navigation patterns

## Technical Implementation Notes

### Performance Considerations
- **Asynchronous Tracking**: Analytics calls don't block page rendering
- **Indexed Queries**: Database indexes on organization_id and created_at
- **Efficient Aggregation**: Server-side data processing reduces client load

### Scalability Features
- **JSONB Metadata**: Flexible metadata storage for future enhancements
- **Time-Based Partitioning Ready**: Schema supports future partitioning
- **Configurable Retention**: Easy to implement data retention policies

### Future Enhancements
- **Real-time Analytics**: WebSocket integration for live data
- **Advanced Filtering**: Filter by event type, date range, user type
- **Export Capabilities**: CSV/PDF export of analytics data
- **Conversion Tracking**: Track specific user actions and goals
- **Comparative Analytics**: Compare performance across time periods

## Environment Variables

```bash
# Enable/disable analytics tracking
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Supabase configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Migration Instructions

1. **Run Database Migration**: Execute `supabase/migrations/add_analytics_tables.sql`
2. **Deploy Code**: Deploy the updated application code
3. **Verify RLS Policies**: Ensure row-level security policies are active
4. **Test Analytics**: Visit subdomain pages and verify tracking in dashboard

This analytics system provides complete visibility into organization website performance while maintaining strict data isolation and user privacy.