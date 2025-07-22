-- Create analytics table to track page views and user interactions
CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" UUID DEFAULT gen_random_uuid() NOT NULL,
    "organization_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL, -- 'page_view', 'team_view', 'player_view', 'blog_view', etc.
    "page_path" TEXT NOT NULL,
    "page_title" TEXT,
    "user_id" UUID, -- NULL for anonymous users
    "session_id" TEXT,
    "ip_address" INET,
    "user_agent" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "metadata" JSONB -- Additional context like team_id, player_id, etc.
);

-- Add primary key
ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");

-- Add foreign key to organizations
ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_organization_id_fkey" 
    FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;

-- Add foreign key to users (nullable)
ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX "idx_analytics_events_organization_id" ON "public"."analytics_events" USING BTREE ("organization_id");
CREATE INDEX "idx_analytics_events_created_at" ON "public"."analytics_events" USING BTREE ("created_at" DESC);
CREATE INDEX "idx_analytics_events_event_type" ON "public"."analytics_events" USING BTREE ("event_type");
CREATE INDEX "idx_analytics_events_organization_date" ON "public"."analytics_events" USING BTREE ("organization_id", "created_at" DESC);

-- Enable row level security
ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins and coaches can view analytics for their organization
CREATE POLICY "Allow org admins/coaches to view analytics" ON "public"."analytics_events" 
FOR SELECT USING (
    "organization_id" IN (
        SELECT "user_organization_roles"."organization_id"
        FROM "public"."user_organization_roles"
        WHERE "user_organization_roles"."user_id" = auth.uid()
        AND "user_organization_roles"."role" IN ('admin', 'coach')
    )
);

-- Allow analytics to be inserted (for tracking)
CREATE POLICY "Allow analytics insertion" ON "public"."analytics_events" 
FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";