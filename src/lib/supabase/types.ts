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
      media_cleanup_jobs: {
        Row: {
          id: string;
          provider: "cloudinary";
          action: "destroy";
          public_id: string;
          resource_type: "image" | "raw" | "video";
          status: "queued" | "processing" | "completed" | "failed";
          attempt_count: number;
          next_attempt_at: string | null;
          locked_at: string | null;
          last_error: string | null;
          completed_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider?: "cloudinary";
          action?: "destroy";
          public_id: string;
          resource_type?: "image" | "raw" | "video";
          status?: "queued" | "processing" | "completed" | "failed";
          attempt_count?: number;
          next_attempt_at?: string | null;
          locked_at?: string | null;
          last_error?: string | null;
          completed_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider?: "cloudinary";
          action?: "destroy";
          public_id?: string;
          resource_type?: "image" | "raw" | "video";
          status?: "queued" | "processing" | "completed" | "failed";
          attempt_count?: number;
          next_attempt_at?: string | null;
          locked_at?: string | null;
          last_error?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
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
    };
    Views: Record<string, never>;
    Functions: {
      claim_media_cleanup_jobs: {
        Args: {
          p_limit?: number;
        };
        Returns: Database["public"]["Tables"]["media_cleanup_jobs"]["Row"][];
      };
      complete_media_cleanup_job: {
        Args: {
          p_job_id: string;
        };
        Returns: undefined;
      };
      delete_moment_and_enqueue_cleanup: {
        Args: {
          p_moment_id: string;
        };
        Returns: { slug: string }[];
      };
      delete_moment_asset_and_enqueue_cleanup: {
        Args: {
          p_asset_id: string;
          p_moment_id: string;
        };
        Returns: { slug: string }[];
      };
      fail_media_cleanup_job: {
        Args: {
          p_error: string;
          p_job_id: string;
          p_retry_at: string;
          p_terminal: boolean;
        };
        Returns: undefined;
      };
      is_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_site_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
