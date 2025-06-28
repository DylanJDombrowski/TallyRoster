

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






CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select role from public.user_roles where user_id = auth.uid()
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";

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
    "player_id" "uuid"
);


ALTER TABLE "public"."alumni" OWNER TO "postgres";


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
    "author_id" "uuid"
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
    "twitter_handle" "text"
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
    "team_image_url" "text"
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


COMMENT ON TABLE "public"."teams" IS 'Stores team information.';



COMMENT ON COLUMN "public"."teams"."name" IS 'e.g., "16U Xpress Premier"';



COMMENT ON COLUMN "public"."teams"."season" IS 'e.g., "2025" or "2024-2025"';



COMMENT ON COLUMN "public"."teams"."primary_color" IS 'Primary branding color for the team (hex code)';



COMMENT ON COLUMN "public"."teams"."secondary_color" IS 'Secondary branding color for the team (hex code)';



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



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."coaches"
    ADD CONSTRAINT "coaches_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_alumni_grad_year" ON "public"."alumni" USING "btree" ("grad_year");



CREATE INDEX "idx_blog_posts_published_date" ON "public"."blog_posts" USING "btree" ("published_date" DESC);



CREATE INDEX "idx_blog_posts_season" ON "public"."blog_posts" USING "btree" ("season");



CREATE INDEX "idx_blog_posts_status" ON "public"."blog_posts" USING "btree" ("status");



CREATE INDEX "idx_coaches_team_id" ON "public"."coaches" USING "btree" ("team_id");



CREATE INDEX "idx_partners_active" ON "public"."partners" USING "btree" ("active");



CREATE INDEX "idx_partners_display_order" ON "public"."partners" USING "btree" ("display_order");



CREATE INDEX "idx_player_stats_player_id" ON "public"."player_stats" USING "btree" ("player_id");



CREATE INDEX "idx_players_status" ON "public"."players" USING "btree" ("status");



CREATE INDEX "idx_players_team_id" ON "public"."players" USING "btree" ("team_id");



CREATE INDEX "idx_schedule_events_date" ON "public"."schedule_events" USING "btree" ("event_date");



CREATE INDEX "idx_schedule_events_team_id" ON "public"."schedule_events" USING "btree" ("team_id");



ALTER TABLE ONLY "public"."alumni"
    ADD CONSTRAINT "alumni_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."coaches"
    ADD CONSTRAINT "coaches_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."player_stats"
    ADD CONSTRAINT "player_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_events"
    ADD CONSTRAINT "schedule_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins have full access" ON "public"."user_roles" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to alumni" ON "public"."alumni" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to blog posts" ON "public"."blog_posts" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to coaches" ON "public"."coaches" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admins full access to partners" ON "public"."partners" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to player stats" ON "public"."player_stats" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admins full access to players" ON "public"."players" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admins full access to schedule" ON "public"."schedule_events" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admins full access to static pages" ON "public"."static_pages" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Allow admins full access to teams" ON "public"."teams" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow authenticated users to view coaches" ON "public"."coaches" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view player stats" ON "public"."player_stats" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view schedule" ON "public"."schedule_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view teams" ON "public"."teams" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow coaches to manage coaches on their team" ON "public"."coaches" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'coach'::"text") AND ("user_roles"."team_id" = "coaches"."team_id")))));



CREATE POLICY "Allow coaches to manage players on their team" ON "public"."players" USING (((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'coach'::"text") AND ("user_roles"."team_id" = "players"."team_id")))) AND ("status" = 'active'::"text"))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'coach'::"text") AND ("user_roles"."team_id" = "players"."team_id")))));



CREATE POLICY "Allow coaches to manage schedule for their team" ON "public"."schedule_events" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'coach'::"text") AND ("user_roles"."team_id" = "schedule_events"."team_id")))));



CREATE POLICY "Allow coaches to manage stats for their team players" ON "public"."player_stats" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."players" "p" ON (("p"."team_id" = "ur"."team_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'coach'::"text") AND ("p"."id" = "player_stats"."player_id")))));



CREATE POLICY "Allow coaches to view players on their team" ON "public"."players" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'coach'::"text") AND ("user_roles"."team_id" = "players"."team_id")))) AND ("status" = 'active'::"text")));



CREATE POLICY "Allow public read access to active partners" ON "public"."partners" FOR SELECT USING (("active" = true));



CREATE POLICY "Allow public read access to active players" ON "public"."players" FOR SELECT TO "anon" USING (("status" = 'active'::"text"));



CREATE POLICY "Allow public read access to alumni" ON "public"."alumni" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to published blog posts" ON "public"."blog_posts" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Allow public read access to published pages" ON "public"."static_pages" FOR SELECT USING (("published" = true));



CREATE POLICY "Allow public read access to teams" ON "public"."teams" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Users can view their own role" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."alumni" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coaches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."player_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."static_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";


















GRANT ALL ON TABLE "public"."alumni" TO "anon";
GRANT ALL ON TABLE "public"."alumni" TO "authenticated";
GRANT ALL ON TABLE "public"."alumni" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."coaches" TO "anon";
GRANT ALL ON TABLE "public"."coaches" TO "authenticated";
GRANT ALL ON TABLE "public"."coaches" TO "service_role";



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
