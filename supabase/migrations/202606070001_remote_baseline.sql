


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."locale_code" AS ENUM (
    'vi',
    'en'
);


ALTER TYPE "public"."locale_code" OWNER TO "postgres";


CREATE TYPE "public"."media_bucket_kind" AS ENUM (
    'public',
    'private'
);


ALTER TYPE "public"."media_bucket_kind" OWNER TO "postgres";


CREATE TYPE "public"."translation_status" AS ENUM (
    'draft',
    'published'
);


ALTER TYPE "public"."translation_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (
    id,
    github_username,
    display_name,
    avatar_url,
    profile_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'user_name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    case
      when coalesce(new.raw_user_meta_data->>'user_name', '') <> ''
      then 'https://github.com/' || (new.raw_user_meta_data->>'user_name')
      else null
    end
  )
  on conflict (id) do update
  set
    github_username = excluded.github_username,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    profile_url = excluded.profile_url,
    updated_at = now();

  insert into public.interview_user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_owner"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.owner_accounts owner
    where owner.auth_user_id = auth.uid()
      and owner.is_active = true
  );
$$;


ALTER FUNCTION "public"."is_owner"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."interview_question_progress" (
    "user_id" "uuid" NOT NULL,
    "question_id" integer NOT NULL,
    "learned_at" timestamp with time zone,
    "bookmarked_at" timestamp with time zone,
    "last_reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "interview_question_progress_has_state" CHECK ((("learned_at" IS NOT NULL) OR ("bookmarked_at" IS NOT NULL) OR ("last_reviewed_at" IS NOT NULL)))
);


ALTER TABLE "public"."interview_question_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_user_preferences" (
    "user_id" "uuid" NOT NULL,
    "pinned_categories" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "preferred_locale" "text" DEFAULT 'vi'::"text" NOT NULL,
    "preferred_mode" "text" DEFAULT 'list'::"text" NOT NULL,
    "last_category" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "interview_user_preferences_locale_check" CHECK (("preferred_locale" = ANY (ARRAY['vi'::"text", 'en'::"text"]))),
    CONSTRAINT "interview_user_preferences_mode_check" CHECK (("preferred_mode" = ANY (ARRAY['list'::"text", 'flashcards'::"text"])))
);


ALTER TABLE "public"."interview_user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid",
    "bucket_kind" "public"."media_bucket_kind" DEFAULT 'public'::"public"."media_bucket_kind" NOT NULL,
    "bucket" "text" NOT NULL,
    "object_path" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "size_bytes" bigint NOT NULL,
    "width" integer,
    "height" integer,
    "checksum" "text",
    "alt_text" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."media_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."owner_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "github_provider_user_id" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."owner_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_revisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "revision_number" integer NOT NULL,
    "snapshot" "jsonb" NOT NULL,
    "published_by" "uuid",
    "published_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."page_revisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "github_username" "text",
    "display_name" "text",
    "avatar_url" "text",
    "profile_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."section_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "status" "public"."translation_status" DEFAULT 'draft'::"public"."translation_status" NOT NULL,
    "content" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."section_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "published_revision_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "position" integer NOT NULL,
    "is_visible" boolean DEFAULT true NOT NULL,
    "variant" "text" DEFAULT 'default'::"text" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_sections" OWNER TO "postgres";


ALTER TABLE ONLY "public"."interview_question_progress"
    ADD CONSTRAINT "interview_question_progress_pkey" PRIMARY KEY ("user_id", "question_id");



ALTER TABLE ONLY "public"."interview_user_preferences"
    ADD CONSTRAINT "interview_user_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_bucket_object_path_key" UNIQUE ("bucket", "object_path");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."owner_accounts"
    ADD CONSTRAINT "owner_accounts_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."owner_accounts"
    ADD CONSTRAINT "owner_accounts_github_provider_user_id_key" UNIQUE ("github_provider_user_id");



ALTER TABLE ONLY "public"."owner_accounts"
    ADD CONSTRAINT "owner_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_revisions"
    ADD CONSTRAINT "page_revisions_page_id_revision_number_key" UNIQUE ("page_id", "revision_number");



ALTER TABLE ONLY "public"."page_revisions"
    ADD CONSTRAINT "page_revisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."section_translations"
    ADD CONSTRAINT "section_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."section_translations"
    ADD CONSTRAINT "section_translations_section_id_locale_key" UNIQUE ("section_id", "locale");



ALTER TABLE ONLY "public"."site_pages"
    ADD CONSTRAINT "site_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_pages"
    ADD CONSTRAINT "site_pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."site_sections"
    ADD CONSTRAINT "site_sections_page_id_position_key" UNIQUE ("page_id", "position");



ALTER TABLE ONLY "public"."site_sections"
    ADD CONSTRAINT "site_sections_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "owner_accounts_one_active_idx" ON "public"."owner_accounts" USING "btree" ("is_active") WHERE "is_active";



CREATE OR REPLACE TRIGGER "set_interview_question_progress_updated_at" BEFORE UPDATE ON "public"."interview_question_progress" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_interview_user_preferences_updated_at" BEFORE UPDATE ON "public"."interview_user_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."interview_question_progress"
    ADD CONSTRAINT "interview_question_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_user_preferences"
    ADD CONSTRAINT "interview_user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owner_accounts"("id");



ALTER TABLE ONLY "public"."owner_accounts"
    ADD CONSTRAINT "owner_accounts_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_revisions"
    ADD CONSTRAINT "page_revisions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."site_pages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_revisions"
    ADD CONSTRAINT "page_revisions_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "public"."owner_accounts"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."section_translations"
    ADD CONSTRAINT "section_translations_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."site_sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_pages"
    ADD CONSTRAINT "site_pages_published_revision_fk" FOREIGN KEY ("published_revision_id") REFERENCES "public"."page_revisions"("id");



ALTER TABLE ONLY "public"."site_sections"
    ADD CONSTRAINT "site_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."site_pages"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete their own interview progress." ON "public"."interview_question_progress" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own interview preferences." ON "public"."interview_user_preferences" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own interview progress." ON "public"."interview_question_progress" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own interview preferences." ON "public"."interview_user_preferences" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own interview progress." ON "public"."interview_question_progress" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own profile." ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can view their own interview preferences." ON "public"."interview_user_preferences" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own interview progress." ON "public"."interview_question_progress" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own profile." ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "anonymous can read public media metadata" ON "public"."media_assets" FOR SELECT USING (("bucket_kind" = 'public'::"public"."media_bucket_kind"));



CREATE POLICY "anonymous can read published pages" ON "public"."site_pages" FOR SELECT USING (("published_revision_id" IS NOT NULL));



CREATE POLICY "anonymous can read revisions" ON "public"."page_revisions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."site_pages" "page"
  WHERE ("page"."published_revision_id" = "page_revisions"."id"))));



ALTER TABLE "public"."interview_question_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_assets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "owner can manage media" ON "public"."media_assets" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "owner can manage owner account" ON "public"."owner_accounts" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "owner can manage pages" ON "public"."site_pages" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "owner can manage revisions" ON "public"."page_revisions" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "owner can manage sections" ON "public"."site_sections" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



CREATE POLICY "owner can manage translations" ON "public"."section_translations" USING ("public"."is_owner"()) WITH CHECK ("public"."is_owner"());



ALTER TABLE "public"."owner_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_revisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."section_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_sections" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_owner"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_owner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_owner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."interview_question_progress" TO "anon";
GRANT ALL ON TABLE "public"."interview_question_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_question_progress" TO "service_role";



GRANT ALL ON TABLE "public"."interview_user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."interview_user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."media_assets" TO "anon";
GRANT ALL ON TABLE "public"."media_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."media_assets" TO "service_role";



GRANT ALL ON TABLE "public"."owner_accounts" TO "anon";
GRANT ALL ON TABLE "public"."owner_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."owner_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."page_revisions" TO "anon";
GRANT ALL ON TABLE "public"."page_revisions" TO "authenticated";
GRANT ALL ON TABLE "public"."page_revisions" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."section_translations" TO "anon";
GRANT ALL ON TABLE "public"."section_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."section_translations" TO "service_role";



GRANT ALL ON TABLE "public"."site_pages" TO "anon";
GRANT ALL ON TABLE "public"."site_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."site_pages" TO "service_role";



GRANT ALL ON TABLE "public"."site_sections" TO "anon";
GRANT ALL ON TABLE "public"."site_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."site_sections" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







