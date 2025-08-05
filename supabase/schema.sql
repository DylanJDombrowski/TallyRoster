

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."aggregate_analytics_daily"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Aggregate page views
    INSERT INTO analytics_page_views (
        organization_id, 
        page_path, 
        page_title, 
        view_date, 
        view_count, 
        unique_sessions
    )
    SELECT 
        organization_id,
        page_path,
        page_title,
        DATE(created_at) as view_date,
        COUNT(*) as view_count,
        COUNT(DISTINCT session_id) as unique_sessions
    FROM analytics_events 
    WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
    AND event_type = 'page_view'
    GROUP BY organization_id, page_path, page_title, DATE(created_at)
    ON CONFLICT (organization_id, page_path, view_date) 
    DO UPDATE SET 
        view_count = EXCLUDED.view_count,
        unique_sessions = EXCLUDED.unique_sessions,
        updated_at = now();

    -- Aggregate team views
    INSERT INTO analytics_team_views (
        organization_id, 
        team_id, 
        view_date, 
        view_count, 
        unique_sessions
    )
    SELECT 
        ae.organization_id,
        (ae.metadata->>'team_id')::uuid as team_id,
        DATE(ae.created_at) as view_date,
        COUNT(*) as view_count,
        COUNT(DISTINCT ae.session_id) as unique_sessions
    FROM analytics_events ae
    WHERE DATE(ae.created_at) = CURRENT_DATE - INTERVAL '1 day'
    AND ae.event_type = 'team_view'
    AND ae.metadata->>'team_id' IS NOT NULL
    GROUP BY ae.organization_id, (ae.metadata->>'team_id')::uuid, DATE(ae.created_at)
    ON CONFLICT (organization_id, team_id, view_date) 
    DO UPDATE SET 
        view_count = EXCLUDED.view_count,
        unique_sessions = EXCLUDED.unique_sessions,
        updated_at = now();

    -- Aggregate player views
    INSERT INTO analytics_player_views (
        organization_id, 
        player_id, 
        view_date, 
        view_count, 
        unique_sessions
    )
    SELECT 
        ae.organization_id,
        (ae.metadata->>'player_id')::uuid as player_id,
        DATE(ae.created_at) as view_date,
        COUNT(*) as view_count,
        COUNT(DISTINCT ae.session_id) as unique_sessions
    FROM analytics_events ae
    WHERE DATE(ae.created_at) = CURRENT_DATE - INTERVAL '1 day'
    AND ae.event_type = 'player_view'
    AND ae.metadata->>'player_id' IS NOT NULL
    GROUP BY ae.organization_id, (ae.metadata->>'player_id')::uuid, DATE(ae.created_at)
    ON CONFLICT (organization_id, player_id, view_date) 
    DO UPDATE SET 
        view_count = EXCLUDED.view_count,
        unique_sessions = EXCLUDED.unique_sessions,
        updated_at = now();
END;
$$;


ALTER FUNCTION "public"."aggregate_analytics_daily"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."aggregate_analytics_daily"() IS 'Aggregates raw analytics events into daily summary tables';



CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select role from public.user_roles where user_id = auth.uid()
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."alumni" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "player_name" "text" NOT NULL,
    "xpress_team" "text",
    "grad_year" integer NOT NULL,
    "position" "text",
    "high_school" "text",
    "college" "text",
    "image_url" "text",
    "hs_logo_url" "text",
    "college_logo_url" "text",
    "player_id" "uuid",
    "organization_id" "uuid"
);


ALTER TABLE "public"."alumni" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "page_path" "text" NOT NULL,
    "page_title" "text",
    "user_id" "uuid",
    "session_id" "text" NOT NULL,
    "user_agent" "text",
    "referrer" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    CONSTRAINT "analytics_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['page_view'::"text", 'team_view'::"text", 'player_view'::"text", 'blog_view'::"text", 'game_view'::"text", 'schedule_view'::"text", 'alumni_view'::"text", 'coach_view'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."analytics_events" IS 'Raw analytics events for tracking page views and interactions';



COMMENT ON COLUMN "public"."analytics_events"."event_type" IS 'Type of analytics event (page_view, team_view, player_view, etc.)';



COMMENT ON COLUMN "public"."analytics_events"."session_id" IS 'Browser session ID for tracking unique visitors';



COMMENT ON COLUMN "public"."analytics_events"."metadata" IS 'Additional event data (team_id, player_id, etc.)';



CREATE TABLE IF NOT EXISTS "public"."analytics_page_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "page_path" "text" NOT NULL,
    "page_title" "text",
    "view_date" "date" NOT NULL,
    "view_count" integer DEFAULT 1 NOT NULL,
    "unique_sessions" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analytics_page_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."analytics_page_views" IS 'Daily aggregated page view statistics';



CREATE TABLE IF NOT EXISTS "public"."analytics_player_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "view_date" "date" NOT NULL,
    "view_count" integer DEFAULT 1 NOT NULL,
    "unique_sessions" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analytics_player_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."analytics_player_views" IS 'Daily aggregated player page view statistics';



CREATE TABLE IF NOT EXISTS "public"."analytics_team_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "view_date" "date" NOT NULL,
    "view_count" integer DEFAULT 1 NOT NULL,
    "unique_sessions" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analytics_team_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."analytics_team_views" IS 'Daily aggregated team page view statistics';



CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "short_description" "text",
    "content" "text" NOT NULL,
    "image_url" "text",
    "published_date" "date" NOT NULL,
    "team_name" "text",
    "season" "text",
    "location" "text",
    "tournament_name" "text",
    "place" "text",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "author_id" "uuid",
    "organization_id" "uuid" NOT NULL
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coaches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "position" "text",
    "email" "text",
    "phone" "text",
    "image_url" "text",
    "bio" "text",
    "order_index" integer DEFAULT 0
);


ALTER TABLE "public"."coaches" OWNER TO "postgres";


COMMENT ON TABLE "public"."coaches" IS 'Stores coach information for each team';



CREATE TABLE IF NOT EXISTS "public"."communication_deliveries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "communication_id" "uuid" NOT NULL,
    "recipient_email" character varying(255) NOT NULL,
    "recipient_name" character varying(255),
    "recipient_type" character varying(50),
    "delivery_channel" character varying(20) NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "opened_at" timestamp with time zone,
    "clicked_at" timestamp with time zone,
    "error_message" "text",
    "external_message_id" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."communication_deliveries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communication_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "auto_managed" boolean DEFAULT false,
    "team_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."communication_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communication_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "subject_template" character varying(500),
    "content_template" "text",
    "template_type" character varying(50),
    "created_by" "uuid" NOT NULL,
    "is_system_template" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."communication_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "subject" character varying(500) NOT NULL,
    "content" "text" NOT NULL,
    "message_type" character varying(50) DEFAULT 'announcement'::character varying,
    "priority" character varying(20) DEFAULT 'normal'::character varying,
    "scheduled_send_at" timestamp with time zone,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "send_email" boolean DEFAULT true,
    "send_sms" boolean DEFAULT false,
    "send_push" boolean DEFAULT false,
    "target_all_org" boolean DEFAULT false,
    "target_teams" "uuid"[],
    "target_groups" "uuid"[],
    "target_individuals" "uuid"[],
    "status" "text" DEFAULT 'draft'::"text",
    "error_message" "text"
);


ALTER TABLE "public"."communications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "opponent" "text" NOT NULL,
    "game_date" "date" NOT NULL,
    "location" "text",
    "home_score" integer DEFAULT 0,
    "away_score" integer DEFAULT 0,
    "inning" integer DEFAULT 1,
    "status" "text" DEFAULT 'scheduled'::"text",
    "is_home" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "organization_id" "uuid"
);


ALTER TABLE "public"."games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "player_id" "uuid",
    "email" character varying(255) NOT NULL,
    "phone" character varying(20),
    "member_type" character varying(50) NOT NULL,
    "member_name" character varying(255),
    "active" boolean DEFAULT true,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "position" integer DEFAULT 0
);


ALTER TABLE "public"."organization_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "primary_color" "text",
    "logo_url" "text",
    "custom_domain" "text",
    "subdomain" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "secondary_color" "text",
    "owner_id" "uuid",
    "organization_type" "text",
    "sport" "text",
    "subscription_plan" "text" DEFAULT 'trial'::"text",
    "trial_ends_at" timestamp without time zone,
    "domain_added" boolean DEFAULT false,
    "slogan" "text",
    "theme" "text" DEFAULT 'light'::"text",
    "domain_verification_token" character varying(255),
    "domain_verified" boolean DEFAULT false,
    "domain_verification_method" character varying(50),
    "domain_ssl_status" character varying(50) DEFAULT 'pending'::character varying,
    "domain_added_at" timestamp with time zone,
    "show_alumni" boolean DEFAULT false,
    "show_blog" boolean DEFAULT true,
    "show_forms_links" boolean DEFAULT true,
    "show_sponsors" boolean DEFAULT false,
    "show_social" boolean DEFAULT true,
    "alumni_nav_label" "text" DEFAULT 'Alumni'::"text",
    "blog_nav_label" "text" DEFAULT 'News'::"text",
    "forms_links_nav_label" "text" DEFAULT 'Forms & Links'::"text",
    "sponsors_nav_label" "text" DEFAULT 'Sponsors'::"text",
    "social_nav_label" "text" DEFAULT 'Social'::"text",
    "facebook_url" "text",
    "twitter_url" "text",
    "instagram_url" "text",
    "social_embed_code" "text",
    "youtube_url" "text",
    "linkedin_url" "text",
    "tiktok_url" "text"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organizations"."facebook_url" IS 'Facebook page URL for footer social links';



COMMENT ON COLUMN "public"."organizations"."twitter_url" IS 'Twitter/X profile URL for footer social links';



COMMENT ON COLUMN "public"."organizations"."instagram_url" IS 'Instagram profile URL for footer social links';



COMMENT ON COLUMN "public"."organizations"."social_embed_code" IS 'HTML/JavaScript embed code for social media feed on social page';



COMMENT ON COLUMN "public"."organizations"."youtube_url" IS 'YouTube channel URL for footer social links';



COMMENT ON COLUMN "public"."organizations"."linkedin_url" IS 'LinkedIn profile URL for footer social links';



COMMENT ON COLUMN "public"."organizations"."tiktok_url" IS 'TikTok profile URL for footer social links';



CREATE TABLE IF NOT EXISTS "public"."partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "website_url" "text",
    "logo_url" "text",
    "partner_type" "text" DEFAULT 'sponsor'::"text",
    "display_order" integer DEFAULT 0,
    "active" boolean DEFAULT true
);


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."player_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "player_id" "uuid" NOT NULL,
    "season" "text",
    "games_played" integer DEFAULT 0,
    "batting_avg" numeric(4,3),
    "hits" integer DEFAULT 0,
    "runs" integer DEFAULT 0,
    "rbis" integer DEFAULT 0,
    "home_runs" integer DEFAULT 0,
    "era" numeric(4,2),
    "wins" integer DEFAULT 0,
    "losses" integer DEFAULT 0
);


ALTER TABLE "public"."player_stats" OWNER TO "postgres";


COMMENT ON TABLE "public"."player_stats" IS 'Stores player statistics by season';



CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "jersey_number" smallint,
    "position" "text",
    "headshot_url" "text",
    "team_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "height" "text",
    "bats" "text",
    "throws" "text",
    "town" "text",
    "school" "text",
    "grad_year" integer,
    "gpa" numeric(3,2),
    "twitter_handle" "text",
    "organization_id" "uuid" NOT NULL,
    "parent_email" character varying(255),
    "parent_phone" character varying(20),
    "parent_name" character varying(255),
    "player_email" character varying(255),
    "emergency_contact_email" character varying(255)
);


ALTER TABLE "public"."players" OWNER TO "postgres";


COMMENT ON TABLE "public"."players" IS 'Stores individual player data.';



COMMENT ON COLUMN "public"."players"."position" IS 'Player''s position, e.g., "P, 1B"';



COMMENT ON COLUMN "public"."players"."headshot_url" IS 'URL to the player''s photo in Supabase Storage.';



COMMENT ON COLUMN "public"."players"."team_id" IS 'Links the player to their team in the teams table.';



COMMENT ON COLUMN "public"."players"."status" IS 'The current status of the player, e.g., ''active'', ''archived''';



COMMENT ON COLUMN "public"."players"."height" IS 'Player height, e.g., "5''6"';



COMMENT ON COLUMN "public"."players"."bats" IS 'Batting preference: L, R, or S (switch)';



COMMENT ON COLUMN "public"."players"."throws" IS 'Throwing hand: L or R';



COMMENT ON COLUMN "public"."players"."gpa" IS 'Grade Point Average (0.00-4.00)';



CREATE TABLE IF NOT EXISTS "public"."schedule_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "event_date" "date" NOT NULL,
    "event_name" "text" NOT NULL,
    "location" "text",
    "sanction" "text",
    "event_type" "text" DEFAULT 'tournament'::"text",
    "start_time" time without time zone,
    "end_time" time without time zone,
    "notes" "text",
    "is_home" boolean DEFAULT false
);


ALTER TABLE "public"."schedule_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedule_events" IS 'Stores tournament/game schedule for teams';



CREATE TABLE IF NOT EXISTS "public"."static_pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "jsonb",
    "meta_description" "text",
    "published" boolean DEFAULT true
);


ALTER TABLE "public"."static_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "season" "text",
    "primary_color" "text",
    "secondary_color" "text",
    "year" integer,
    "team_image_url" "text",
    "organization_id" "uuid"
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


COMMENT ON TABLE "public"."teams" IS 'Stores team information.';



COMMENT ON COLUMN "public"."teams"."name" IS 'e.g., "16U Xpress Premier"';



COMMENT ON COLUMN "public"."teams"."season" IS 'e.g., "2025" or "2024-2025"';



COMMENT ON COLUMN "public"."teams"."primary_color" IS 'Primary branding color for the team (hex code)';



COMMENT ON COLUMN "public"."teams"."secondary_color" IS 'Secondary branding color for the team (hex code)';



CREATE TABLE IF NOT EXISTS "public"."user_organization_roles" (
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    CONSTRAINT "user_organization_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'coach'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."user_organization_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "first_name" character varying(255),
    "last_name" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text"
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "team_id" "uuid",
    "role" "text" NOT NULL,
    CONSTRAINT "user_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'coach'::"text", 'parent'::"text"])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."alumni"
    ADD CONSTRAINT "alumni_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_page_views"
    ADD CONSTRAINT "analytics_page_views_org_path_date_unique" UNIQUE ("organization_id", "page_path", "view_date");



ALTER TABLE ONLY "public"."analytics_page_views"
    ADD CONSTRAINT "analytics_page_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_player_views"
    ADD CONSTRAINT "analytics_player_views_org_player_date_unique" UNIQUE ("organization_id", "player_id", "view_date");



ALTER TABLE ONLY "public"."analytics_player_views"
    ADD CONSTRAINT "analytics_player_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_team_views"
    ADD CONSTRAINT "analytics_team_views_org_team_date_unique" UNIQUE ("organization_id", "team_id", "view_date");



ALTER TABLE ONLY "public"."analytics_team_views"
    ADD CONSTRAINT "analytics_team_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."coaches"
    ADD CONSTRAINT "coaches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communication_deliveries"
    ADD CONSTRAINT "communication_deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communication_groups"
    ADD CONSTRAINT "communication_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communication_templates"
    ADD CONSTRAINT "communication_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communications"
    ADD CONSTRAINT "communications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_links"
    ADD CONSTRAINT "organization_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_subdomain_key" UNIQUE ("subdomain");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_stats"
    ADD CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedule_events"
    ADD CONSTRAINT "schedule_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."static_pages"
    ADD CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."static_pages"
    ADD CONSTRAINT "static_pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "user_organization_roles_pkey" PRIMARY KEY ("user_id", "organization_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_alumni_grad_year" ON "public"."alumni" USING "btree" ("grad_year");



CREATE INDEX "idx_analytics_events_org_created" ON "public"."analytics_events" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "idx_analytics_events_path" ON "public"."analytics_events" USING "btree" ("page_path");



CREATE INDEX "idx_analytics_events_session" ON "public"."analytics_events" USING "btree" ("session_id");



CREATE INDEX "idx_analytics_events_type" ON "public"."analytics_events" USING "btree" ("event_type");



CREATE INDEX "idx_analytics_page_views_org_date" ON "public"."analytics_page_views" USING "btree" ("organization_id", "view_date" DESC);



CREATE INDEX "idx_analytics_player_views_org_date" ON "public"."analytics_player_views" USING "btree" ("organization_id", "view_date" DESC);



CREATE INDEX "idx_analytics_player_views_player_date" ON "public"."analytics_player_views" USING "btree" ("player_id", "view_date" DESC);



CREATE INDEX "idx_analytics_team_views_org_date" ON "public"."analytics_team_views" USING "btree" ("organization_id", "view_date" DESC);



CREATE INDEX "idx_analytics_team_views_team_date" ON "public"."analytics_team_views" USING "btree" ("team_id", "view_date" DESC);



CREATE INDEX "idx_blog_posts_organization_id" ON "public"."blog_posts" USING "btree" ("organization_id");



CREATE INDEX "idx_blog_posts_published_date" ON "public"."blog_posts" USING "btree" ("published_date" DESC);



CREATE INDEX "idx_blog_posts_season" ON "public"."blog_posts" USING "btree" ("season");



CREATE INDEX "idx_blog_posts_status" ON "public"."blog_posts" USING "btree" ("status");



CREATE INDEX "idx_coaches_team_id" ON "public"."coaches" USING "btree" ("team_id");



CREATE INDEX "idx_communications_org_sent" ON "public"."communications" USING "btree" ("organization_id", "sent_at" DESC);



CREATE INDEX "idx_communications_scheduled" ON "public"."communications" USING "btree" ("scheduled_send_at") WHERE ("scheduled_send_at" IS NOT NULL);



CREATE INDEX "idx_deliveries_communication" ON "public"."communication_deliveries" USING "btree" ("communication_id");



CREATE INDEX "idx_deliveries_status" ON "public"."communication_deliveries" USING "btree" ("status");



CREATE INDEX "idx_group_members_group" ON "public"."group_members" USING "btree" ("group_id");



CREATE INDEX "idx_group_members_player" ON "public"."group_members" USING "btree" ("player_id");



CREATE INDEX "idx_organization_links_position" ON "public"."organization_links" USING "btree" ("organization_id", "position");



CREATE INDEX "idx_partners_active" ON "public"."partners" USING "btree" ("active");



CREATE INDEX "idx_partners_display_order" ON "public"."partners" USING "btree" ("display_order");



CREATE INDEX "idx_player_stats_player_id" ON "public"."player_stats" USING "btree" ("player_id");



CREATE INDEX "idx_players_organization_id" ON "public"."players" USING "btree" ("organization_id");



CREATE INDEX "idx_players_status" ON "public"."players" USING "btree" ("status");



CREATE INDEX "idx_players_team_id" ON "public"."players" USING "btree" ("team_id");



CREATE INDEX "idx_schedule_events_date" ON "public"."schedule_events" USING "btree" ("event_date");



CREATE INDEX "idx_schedule_events_team_id" ON "public"."schedule_events" USING "btree" ("team_id");



CREATE INDEX "idx_user_organization_roles_user_org" ON "public"."user_organization_roles" USING "btree" ("user_id", "organization_id");



ALTER TABLE ONLY "public"."alumni"
    ADD CONSTRAINT "alumni_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alumni"
    ADD CONSTRAINT "alumni_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."analytics_page_views"
    ADD CONSTRAINT "analytics_page_views_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_player_views"
    ADD CONSTRAINT "analytics_player_views_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_player_views"
    ADD CONSTRAINT "analytics_player_views_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_team_views"
    ADD CONSTRAINT "analytics_team_views_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_team_views"
    ADD CONSTRAINT "analytics_team_views_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coaches"
    ADD CONSTRAINT "coaches_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communication_deliveries"
    ADD CONSTRAINT "communication_deliveries_communication_id_fkey" FOREIGN KEY ("communication_id") REFERENCES "public"."communications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communication_groups"
    ADD CONSTRAINT "communication_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."communication_groups"
    ADD CONSTRAINT "communication_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communication_groups"
    ADD CONSTRAINT "communication_groups_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."communication_templates"
    ADD CONSTRAINT "communication_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."communication_templates"
    ADD CONSTRAINT "communication_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communications"
    ADD CONSTRAINT "communications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communications"
    ADD CONSTRAINT "communications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."communication_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_links"
    ADD CONSTRAINT "organization_links_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."player_stats"
    ADD CONSTRAINT "player_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_events"
    ADD CONSTRAINT "schedule_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "user_organization_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "user_organization_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can view organization user profiles" ON "public"."user_profiles" FOR SELECT USING (("user_id" IN ( SELECT "uor"."user_id"
   FROM "public"."user_organization_roles" "uor"
  WHERE ("uor"."organization_id" IN ( SELECT "user_organization_roles"."organization_id"
           FROM "public"."user_organization_roles"
          WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = 'admin'::"text")))))));



CREATE POLICY "Allow admin or coach to update teams" ON "public"."teams" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."organization_id" = "teams"."organization_id") AND ("user_organization_roles"."user_id" = "auth"."uid"()) AND (("user_organization_roles"."role" = 'admin'::"text") OR ("user_organization_roles"."role" = 'coach'::"text"))))));



CREATE POLICY "Allow admin to create teams" ON "public"."teams" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."organization_id" = "teams"."organization_id") AND ("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admin to delete teams" ON "public"."teams" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."organization_id" = "teams"."organization_id") AND ("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admins full access to alumni" ON "public"."alumni" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to blog posts" ON "public"."blog_posts" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to partners" ON "public"."partners" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to static pages" ON "public"."static_pages" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins to manage games in their org" ON "public"."games" USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."organization_id" = "games"."organization_id") AND ("user_organization_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admins to update their organization" ON "public"."organizations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."organization_id" = "organizations"."id") AND ("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."organization_id" = "organizations"."id") AND ("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow authenticated users to view coaches" ON "public"."coaches" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view player stats" ON "public"."player_stats" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view schedule" ON "public"."schedule_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view teams" ON "public"."teams" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow org admins and coaches to view analytics events" ON "public"."analytics_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."organization_id" = "analytics_events"."organization_id") AND ("user_organization_roles"."role" = ANY (ARRAY['admin'::"text", 'coach'::"text"]))))));



CREATE POLICY "Allow org admins and coaches to view page analytics" ON "public"."analytics_page_views" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."organization_id" = "analytics_page_views"."organization_id") AND ("user_organization_roles"."role" = ANY (ARRAY['admin'::"text", 'coach'::"text"]))))));



CREATE POLICY "Allow org admins and coaches to view team analytics" ON "public"."analytics_team_views" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."organization_id" = "analytics_team_views"."organization_id") AND ("user_organization_roles"."role" = ANY (ARRAY['admin'::"text", 'coach'::"text"]))))));



CREATE POLICY "Allow org admins to manage all players in their org" ON "public"."players" USING (("organization_id" IN ( SELECT "user_organization_roles"."organization_id"
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow org admins to manage coaches in their org" ON "public"."coaches" USING (("team_id" IN ( SELECT "t"."id"
   FROM ("public"."teams" "t"
     JOIN "public"."user_organization_roles" "uor" ON (("t"."organization_id" = "uor"."organization_id")))
  WHERE (("uor"."user_id" = "auth"."uid"()) AND ("uor"."role" = 'admin'::"text")))));



CREATE POLICY "Allow org admins to manage player stats in their org" ON "public"."player_stats" USING (("player_id" IN ( SELECT "p"."id"
   FROM ("public"."players" "p"
     JOIN "public"."user_organization_roles" "uor" ON (("p"."organization_id" = "uor"."organization_id")))
  WHERE (("uor"."user_id" = "auth"."uid"()) AND ("uor"."role" = 'admin'::"text")))));



CREATE POLICY "Allow org admins to manage schedule in their org" ON "public"."schedule_events" USING (("team_id" IN ( SELECT "t"."id"
   FROM ("public"."teams" "t"
     JOIN "public"."user_organization_roles" "uor" ON (("t"."organization_id" = "uor"."organization_id")))
  WHERE (("uor"."user_id" = "auth"."uid"()) AND ("uor"."role" = 'admin'::"text")))));



CREATE POLICY "Allow org admins to manage teams in their org" ON "public"."teams" USING (("organization_id" IN ( SELECT "user_organization_roles"."organization_id"
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow org coaches to manage player stats in their org" ON "public"."player_stats" USING (("player_id" IN ( SELECT "p"."id"
   FROM ("public"."players" "p"
     JOIN "public"."user_organization_roles" "uor" ON (("p"."organization_id" = "uor"."organization_id")))
  WHERE (("uor"."user_id" = "auth"."uid"()) AND ("uor"."role" = ANY (ARRAY['admin'::"text", 'coach'::"text"]))))));



CREATE POLICY "Allow org coaches to manage players in their org" ON "public"."players" USING ((("organization_id" IN ( SELECT "user_organization_roles"."organization_id"
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."user_id" = "auth"."uid"()) AND ("user_organization_roles"."role" = ANY (ARRAY['admin'::"text", 'coach'::"text"]))))) AND ("status" = 'active'::"text")));



CREATE POLICY "Allow org coaches to manage schedule in their org" ON "public"."schedule_events" USING (("team_id" IN ( SELECT "t"."id"
   FROM ("public"."teams" "t"
     JOIN "public"."user_organization_roles" "uor" ON (("t"."organization_id" = "uor"."organization_id")))
  WHERE (("uor"."user_id" = "auth"."uid"()) AND ("uor"."role" = ANY (ARRAY['admin'::"text", 'coach'::"text"]))))));



CREATE POLICY "Allow org coaches to view coaches in their org" ON "public"."coaches" FOR SELECT USING (("team_id" IN ( SELECT "t"."id"
   FROM ("public"."teams" "t"
     JOIN "public"."user_organization_roles" "uor" ON (("t"."organization_id" = "uor"."organization_id")))
  WHERE (("uor"."user_id" = "auth"."uid"()) AND ("uor"."role" = ANY (ARRAY['admin'::"text", 'coach'::"text"]))))));



CREATE POLICY "Allow org members to manage their blog posts" ON "public"."blog_posts" USING (("organization_id" IN ( SELECT "user_organization_roles"."organization_id"
   FROM "public"."user_organization_roles"
  WHERE ("user_organization_roles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow org members to view players in their org" ON "public"."players" FOR SELECT USING ((("organization_id" IN ( SELECT "user_organization_roles"."organization_id"
   FROM "public"."user_organization_roles"
  WHERE ("user_organization_roles"."user_id" = "auth"."uid"()))) AND ("status" = 'active'::"text")));



CREATE POLICY "Allow public read access to active partners" ON "public"."partners" FOR SELECT USING (("active" = true));



CREATE POLICY "Allow public read access to active players" ON "public"."players" FOR SELECT TO "anon" USING (("status" = 'active'::"text"));



CREATE POLICY "Allow public read access to alumni" ON "public"."alumni" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to coaches" ON "public"."coaches" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read access to games" ON "public"."games" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read access to organization links" ON "public"."organization_links" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read access to organizations" ON "public"."organizations" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read access to published blog posts" ON "public"."blog_posts" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Allow public read access to published pages" ON "public"."static_pages" FOR SELECT USING (("published" = true));



CREATE POLICY "Allow public read access to schedule events" ON "public"."schedule_events" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read access to teams" ON "public"."teams" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Allow public read for published blog posts by org" ON "public"."blog_posts" FOR SELECT TO "anon" USING (("status" = 'published'::"text"));



CREATE POLICY "Allow public to insert analytics events for tracking" ON "public"."analytics_events" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow read access to own organization's links" ON "public"."organization_links" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles" "uor"
  WHERE (("uor"."organization_id" = "organization_links"."organization_id") AND ("uor"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow service role to insert analytics events" ON "public"."analytics_events" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow service role to manage page views" ON "public"."analytics_page_views" USING (true);



CREATE POLICY "Allow service role to manage player views" ON "public"."analytics_player_views" USING (true);



CREATE POLICY "Allow service role to manage team views" ON "public"."analytics_team_views" USING (true);



CREATE POLICY "Allow team members to view teams" ON "public"."teams" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."organization_id" = "teams"."organization_id") AND ("user_organization_roles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow users to see teams in their organization" ON "public"."teams" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles"
  WHERE (("user_organization_roles"."organization_id" = "teams"."organization_id") AND ("user_organization_roles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Org admins can manage user_roles" ON "public"."user_roles" USING ((EXISTS ( SELECT 1
   FROM "public"."user_organization_roles" "uor"
  WHERE (("uor"."user_id" = "auth"."uid"()) AND ("uor"."role" = 'admin'::"text")))));



CREATE POLICY "Users can create organizations" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can read their organizations" ON "public"."organizations" FOR SELECT TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR ("id" IN ( SELECT "user_organization_roles"."organization_id"
   FROM "public"."user_organization_roles"
  WHERE ("user_organization_roles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own user_role" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."alumni" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_page_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_player_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_team_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coaches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."static_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."aggregate_analytics_daily"() TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_analytics_daily"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_analytics_daily"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."alumni" TO "anon";
GRANT ALL ON TABLE "public"."alumni" TO "authenticated";
GRANT ALL ON TABLE "public"."alumni" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_page_views" TO "anon";
GRANT ALL ON TABLE "public"."analytics_page_views" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_page_views" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_player_views" TO "anon";
GRANT ALL ON TABLE "public"."analytics_player_views" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_player_views" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_team_views" TO "anon";
GRANT ALL ON TABLE "public"."analytics_team_views" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_team_views" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."coaches" TO "anon";
GRANT ALL ON TABLE "public"."coaches" TO "authenticated";
GRANT ALL ON TABLE "public"."coaches" TO "service_role";



GRANT ALL ON TABLE "public"."communication_deliveries" TO "anon";
GRANT ALL ON TABLE "public"."communication_deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."communication_deliveries" TO "service_role";



GRANT ALL ON TABLE "public"."communication_groups" TO "anon";
GRANT ALL ON TABLE "public"."communication_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."communication_groups" TO "service_role";



GRANT ALL ON TABLE "public"."communication_templates" TO "anon";
GRANT ALL ON TABLE "public"."communication_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."communication_templates" TO "service_role";



GRANT ALL ON TABLE "public"."communications" TO "anon";
GRANT ALL ON TABLE "public"."communications" TO "authenticated";
GRANT ALL ON TABLE "public"."communications" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."organization_links" TO "anon";
GRANT ALL ON TABLE "public"."organization_links" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_links" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."partners" TO "anon";
GRANT ALL ON TABLE "public"."partners" TO "authenticated";
GRANT ALL ON TABLE "public"."partners" TO "service_role";



GRANT ALL ON TABLE "public"."player_stats" TO "anon";
GRANT ALL ON TABLE "public"."player_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."player_stats" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_events" TO "anon";
GRANT ALL ON TABLE "public"."schedule_events" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_events" TO "service_role";



GRANT ALL ON TABLE "public"."static_pages" TO "anon";
GRANT ALL ON TABLE "public"."static_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."static_pages" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."user_organization_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_organization_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_organization_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
