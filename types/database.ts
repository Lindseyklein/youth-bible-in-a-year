export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          email: string | null;
          subscription_status: string;
          subscription_started_at: string | null;
          subscription_ends_at: string | null;
          polar_customer_id: string | null;
          has_seen_trial_modal: boolean;
          reminder_enabled: boolean;
          reminder_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          email?: string | null;
          avatar_url?: string | null;
          subscription_status?: string;
          subscription_started_at?: string | null;
          subscription_ends_at?: string | null;
          polar_customer_id?: string | null;
          has_seen_trial_modal?: boolean;
          reminder_enabled?: boolean;
          reminder_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          email?: string | null;
          avatar_url?: string | null;
          subscription_status?: string;
          subscription_started_at?: string | null;
          subscription_ends_at?: string | null;
          polar_customer_id?: string | null;
          has_seen_trial_modal?: boolean;
          reminder_enabled?: boolean;
          reminder_time?: string;
          updated_at?: string;
        };
      };
      reading_plans: {
        Row: {
          id: string;
          title: string;
          description: string;
          total_weeks: number;
          created_at: string;
        };
      };
      daily_readings: {
        Row: {
          id: string;
          plan_id: string;
          week_number: number;
          day_number: number;
          title: string;
          scripture_references: string[];
          summary: string | null;
          redemption_story: string | null;
          key_verse: string | null;
          reflection_question: string | null;
          created_at: string;
        };
      };
      weekly_studies: {
        Row: {
          id: string;
          plan_id: string;
          week_number: number;
          title: string;
          theme: string;
          discussion_questions: Json;
          reflection_prompts: string[];
          created_at: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          reading_id: string;
          completed: boolean;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          reading_id: string;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
        };
      };
      study_groups: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          name: string;
          created_by: string;
          is_active?: boolean;
        };
      };
      study_group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          joined_at: string;
          is_admin: boolean;
        };
        Insert: {
          group_id: string;
          user_id: string;
          is_admin?: boolean;
        };
      };
      group_study_responses: {
        Row: {
          id: string;
          group_id: string;
          study_id: string;
          user_id: string;
          responses: Json;
          created_at: string;
          updated_at: string;
        };
      };
      bible_versions: {
        Row: {
          id: string;
          abbreviation: string;
          name: string;
          description: string | null;
          language: string;
          is_active: boolean;
          created_at: string;
        };
      };
      bible_books: {
        Row: {
          id: string;
          name: string;
          testament: string;
          book_number: number;
          chapter_count: number;
          created_at: string;
        };
      };
      bible_verses: {
        Row: {
          id: string;
          version_id: string;
          book_id: string;
          chapter: number;
          verse: number;
          text: string;
          created_at: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          preferred_bible_version: string | null;
          audio_speed: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          preferred_bible_version?: string | null;
          audio_speed?: number;
        };
        Update: {
          preferred_bible_version?: string | null;
          audio_speed?: number;
          updated_at?: string;
        };
      };
      user_streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_reading_date: string | null;
          total_readings_completed: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_reading_date?: string | null;
          total_readings_completed?: number;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_reading_date?: string | null;
          total_readings_completed?: number;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          requirement: number;
          points: number;
          created_at: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
          progress: number;
        };
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          post_type: string;
          content: string;
          verse_reference: string | null;
          image_url: string | null;
          is_moderated: boolean;
          is_approved: boolean;
          likes_count: number;
          comments_count: number;
          created_at: string;
        };
      };
      favorite_verses: {
        Row: {
          id: string;
          user_id: string;
          reading_id: string;
          verse_reference: string;
          verse_text: string;
          note: string | null;
          created_at: string;
        };
      };
      bible_verse_cache: {
        Row: {
          cache_key: string;
          verses: Json;
          cached_at: string;
          created_at: string;
        };
        Insert: {
          cache_key: string;
          verses: Json;
          cached_at?: string;
          created_at?: string;
        };
        Update: {
          cache_key?: string;
          verses?: Json;
          cached_at?: string;
        };
      };
    };
  };
}
