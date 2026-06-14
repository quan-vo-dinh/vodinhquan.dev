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
      moment_media_assets: {
        Row: {
          id: string;
          moment_id: string | null;
          cloudinary_public_id: string;
          cloudinary_asset_id: string | null;
          resource_type: "image" | "video" | "raw" | "auto";
          secure_url: string;
          width: number | null;
          height: number | null;
          format: string | null;
          bytes: number | null;
          alt: string | null;
          caption: string | null;
          sort_order: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          moment_id?: string | null;
          cloudinary_public_id: string;
          cloudinary_asset_id?: string | null;
          resource_type?: "image" | "video" | "raw" | "auto";
          secure_url: string;
          width?: number | null;
          height?: number | null;
          format?: string | null;
          bytes?: number | null;
          alt?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          moment_id?: string | null;
          cloudinary_public_id?: string;
          cloudinary_asset_id?: string | null;
          resource_type?: "image" | "video" | "raw" | "auto";
          secure_url?: string;
          width?: number | null;
          height?: number | null;
          format?: string | null;
          bytes?: number | null;
          alt?: string | null;
          caption?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      moments: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          note_markdown: string | null;
          occurred_at: string | null;
          location: string | null;
          status: "draft" | "published" | "archived";
          visibility: "public" | "private";
          cover_asset_id: string | null;
          tags: string[];
          created_by: string;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          sort_key: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          note_markdown?: string | null;
          occurred_at?: string | null;
          location?: string | null;
          status?: "draft" | "published" | "archived";
          visibility?: "public" | "private";
          cover_asset_id?: string | null;
          tags?: string[];
          created_by: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          sort_key?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string | null;
          note_markdown?: string | null;
          occurred_at?: string | null;
          location?: string | null;
          status?: "draft" | "published" | "archived";
          visibility?: "public" | "private";
          cover_asset_id?: string | null;
          tags?: string[];
          updated_at?: string;
          published_at?: string | null;
          sort_key?: string;
        };
        Relationships: [];
      };
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
        Relationships: [];
      };
      site_owner_accounts: {
        Row: {
          user_id: string;
          github_username: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          github_username: string;
          created_at?: string;
        };
        Update: {
          github_username?: string;
        };
        Relationships: [];
      };
      interview_owner_accounts: {
        Row: {
          user_id: string;
          github_username: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          github_username: string;
          created_at?: string;
        };
        Update: {
          github_username?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_interview_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_site_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      merge_interview_learning_state: {
        Args: {
          p_learned_ids: number[];
          p_bookmarked_ids: number[];
          p_pinned_categories: string[];
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
