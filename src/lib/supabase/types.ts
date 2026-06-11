export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          github_username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          profile_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          github_username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          profile_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          github_username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          profile_url?: string | null;
          updated_at?: string;
        };
      };
      interview_question_progress: {
        Row: {
          user_id: string;
          question_id: number;
          learned_at: string | null;
          bookmarked_at: string | null;
          last_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          question_id: number;
          learned_at?: string | null;
          bookmarked_at?: string | null;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          learned_at?: string | null;
          bookmarked_at?: string | null;
          last_reviewed_at?: string | null;
          updated_at?: string;
        };
      };
      interview_user_preferences: {
        Row: {
          user_id: string;
          pinned_categories: string[];
          preferred_locale: "vi" | "en";
          preferred_mode: "list" | "flashcards";
          last_category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          pinned_categories?: string[];
          preferred_locale?: "vi" | "en";
          preferred_mode?: "list" | "flashcards";
          last_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pinned_categories?: string[];
          preferred_locale?: "vi" | "en";
          preferred_mode?: "list" | "flashcards";
          last_category?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
