```mermaid
graph TD
    A[Visitor visits subdomain site] --> B[AnalyticsTracker Component]
    B --> C{Event Type}
    
    C -->|Page View| D[Track Page View]
    C -->|Team Page| E[Track Team View]
    C -->|Player Page| F[Track Player View]
    C -->|Blog Post| G[Track Blog View]
    
    D --> H[Supabase Insert]
    E --> H
    F --> H
    G --> H
    
    H --> I[analytics_events table]
    I --> J[RLS: Filter by organization_id]
    
    K[Admin/Coach logs in] --> L[Dashboard Analytics Page]
    L --> M[Server-side Analytics Query]
    M --> J
    J --> N[Aggregated Data]
    
    N --> O[Analytics Dashboard]
    O --> P[Summary Cards]
    O --> Q[Top Pages Chart]
    O --> R[Views Over Time]
    O --> S[Recent Activity]
    
    subgraph "Data Isolation"
        T[Organization A Data]
        U[Organization B Data]
        V[Organization C Data]
        J --> T
        J --> U
        J --> V
    end
    
    subgraph "Analytics Events Table Schema"
        W[id: UUID<br/>organization_id: UUID<br/>event_type: TEXT<br/>page_path: TEXT<br/>page_title: TEXT<br/>user_id: UUID nullable<br/>session_id: TEXT<br/>created_at: TIMESTAMP<br/>metadata: JSONB]
    end
```

## Analytics System Architecture

### Data Flow
1. **Visitor Activity**: User visits any page on a subdomain organization site
2. **Automatic Tracking**: AnalyticsTracker component automatically captures the event
3. **Event Classification**: System determines event type (page_view, team_view, etc.)
4. **Secure Storage**: Event is stored in analytics_events table with organization isolation
5. **Dashboard Access**: Admins/coaches view analytics through dedicated dashboard
6. **Data Visualization**: Analytics are presented in charts, tables, and summary cards

### Key Features
- ✅ **Complete Data Isolation**: Each organization only sees their own analytics
- ✅ **Role-Based Access**: Only admins and coaches can view analytics  
- ✅ **Real-time Tracking**: Events are captured immediately when they occur
- ✅ **Privacy Conscious**: Anonymous tracking with optional user identification
- ✅ **Performance Optimized**: Non-blocking tracking and efficient queries
- ✅ **Comprehensive Metrics**: Page views, team/player engagement, and trends