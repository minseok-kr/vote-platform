// Supabase Database Types

export type PollCategory =
  | "tech"
  | "sports"
  | "entertainment"
  | "politics"
  | "lifestyle"
  | "business"
  | "other";

export type PollStatus = "active" | "completed";

export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          question: string;
          description: string | null;
          category: PollCategory;
          status: PollStatus;
          is_featured: boolean;
          total_votes: number;
          created_at: string;
          expires_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          description?: string | null;
          category?: PollCategory;
          status?: PollStatus;
          is_featured?: boolean;
          total_votes?: number;
          created_at?: string;
          expires_at: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          description?: string | null;
          category?: PollCategory;
          status?: PollStatus;
          is_featured?: boolean;
          total_votes?: number;
          created_at?: string;
          expires_at?: string;
          updated_at?: string;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          votes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
          votes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          text?: string;
          votes?: number;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          visitor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          visitor_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          visitor_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      polls_with_options: {
        Row: {
          id: string;
          question: string;
          description: string | null;
          category: PollCategory;
          status: PollStatus;
          is_featured: boolean;
          total_votes: number;
          created_at: string;
          expires_at: string;
          updated_at: string;
          options: PollOptionWithPercentage[];
        };
      };
    };
    Functions: {
      increment_option_votes: {
        Args: { option_uuid: string };
        Returns: void;
      };
      complete_expired_polls: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}

// Application Types
export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  votes: number;
  created_at: string;
}

export interface PollOptionWithPercentage {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  description: string | null;
  category: PollCategory;
  status: PollStatus;
  is_featured: boolean;
  total_votes: number;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface PollWithOptions extends Poll {
  options: PollOptionWithPercentage[];
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  visitor_id: string;
  created_at: string;
}

// API Types
export interface CreatePollRequest {
  question: string;
  description?: string;
  category?: PollCategory;
  options: string[];
  expires_at: string;
}

export interface VoteRequest {
  poll_id: string;
  option_id: string;
  visitor_id: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
