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
      alumni: {
        Row: {
          college: string | null;
          college_logo_url: string | null;
          created_at: string;
          grad_year: number;
          high_school: string | null;
          hs_logo_url: string | null;
          id: string;
          image_url: string | null;
          player_id: string | null;
          player_name: string;
          position: string | null;
          xpress_team: string | null;
        };
        Insert: {
          college?: string | null;
          college_logo_url?: string | null;
          created_at?: string;
          grad_year: number;
          high_school?: string | null;
          hs_logo_url?: string | null;
          id?: string;
          image_url?: string | null;
          player_id?: string | null;
          player_name: string;
          position?: string | null;
          xpress_team?: string | null;
        };
        Update: {
          college?: string | null;
          college_logo_url?: string | null;
          created_at?: string;
          grad_year?: number;
          high_school?: string | null;
          hs_logo_url?: string | null;
          id?: string;
          image_url?: string | null;
          player_id?: string | null;
          player_name?: string;
          position?: string | null;
          xpress_team?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alumni_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };

      organizations: {
        Row: {
          id: string; // uuid
          name: string;
          primary_color: string | null;
          secondary_color: string | null; // <-- ADD THIS LINE
          logo_url: string | null;
          custom_domain: string | null;
          subdomain: string | null;
          created_at: string; // timestamptz
        };
        Insert: {
          id?: string; // uuid
          name: string;
          primary_color?: string | null;
          secondary_color?: string | null; // <-- ADD THIS LINE
          logo_url?: string | null;
          custom_domain?: string | null;
          subdomain?: string | null;
          created_at?: string; // timestamptz
        };
        Update: {
          id?: string; // uuid
          name?: string;
          primary_color?: string | null;
          secondary_color?: string | null; // <-- ADD THIS LINE
          logo_url?: string | null;
          custom_domain?: string | null;
          subdomain?: string | null;
          created_at?: string; // timestamptz
        };
        Relationships: [];
      };

      user_organization_roles: {
        Row: {
          user_id: string; // uuid
          organization_id: string; // uuid
          role: string;
        };
        Insert: {
          user_id: string; // uuid
          organization_id: string; // uuid
          role: string;
        };
        Update: {
          user_id?: string; // uuid
          organization_id?: string; // uuid
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_organization_roles_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_organization_roles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      blog_posts: {
        Row: {
          author_id: string | null;
          content: string;
          created_at: string;
          id: string;
          image_url: string | null;
          location: string | null;
          place: string | null;
          published_date: string;
          season: string | null;
          short_description: string | null;
          slug: string;
          status: string;
          team_name: string | null;
          title: string;
          tournament_name: string | null;
        };
        Insert: {
          author_id?: string | null;
          content: string;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          place?: string | null;
          published_date: string;
          season?: string | null;
          short_description?: string | null;
          slug: string;
          status?: string;
          team_name?: string | null;
          title: string;
          tournament_name?: string | null;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          place?: string | null;
          published_date?: string;
          season?: string | null;
          short_description?: string | null;
          slug?: string;
          status?: string;
          team_name?: string | null;
          title?: string;
          tournament_name?: string | null;
        };
        Relationships: [];
      };
      coaches: {
        Row: {
          bio: string | null;
          created_at: string;
          email: string | null;
          id: string;
          image_url: string | null;
          name: string;
          order_index: number | null;
          phone: string | null;
          position: string | null;
          team_id: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          order_index?: number | null;
          phone?: string | null;
          position?: string | null;
          team_id: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          order_index?: number | null;
          phone?: string | null;
          position?: string | null;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coaches_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      partners: {
        Row: {
          active: boolean | null;
          created_at: string;
          description: string | null;
          display_order: number | null;
          id: string;
          logo_url: string | null;
          name: string;
          partner_type: string | null;
          website_url: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          partner_type?: string | null;
          website_url?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          partner_type?: string | null;
          website_url?: string | null;
        };
        Relationships: [];
      };
      player_stats: {
        Row: {
          batting_avg: number | null;
          created_at: string;
          era: number | null;
          games_played: number | null;
          hits: number | null;
          home_runs: number | null;
          id: string;
          losses: number | null;
          player_id: string;
          rbis: number | null;
          runs: number | null;
          season: string | null;
          wins: number | null;
        };
        Insert: {
          batting_avg?: number | null;
          created_at?: string;
          era?: number | null;
          games_played?: number | null;
          hits?: number | null;
          home_runs?: number | null;
          id?: string;
          losses?: number | null;
          player_id: string;
          rbis?: number | null;
          runs?: number | null;
          season?: string | null;
          wins?: number | null;
        };
        Update: {
          batting_avg?: number | null;
          created_at?: string;
          era?: number | null;
          games_played?: number | null;
          hits?: number | null;
          home_runs?: number | null;
          id?: string;
          losses?: number | null;
          player_id?: string;
          rbis?: number | null;
          runs?: number | null;
          season?: string | null;
          wins?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      players: {
        Row: {
          bats: string | null;
          created_at: string;
          first_name: string;
          gpa: number | null;
          grad_year: number | null;
          headshot_url: string | null;
          height: string | null;
          id: string;
          jersey_number: number | null;
          last_name: string;
          position: string | null;
          school: string | null;
          status: string;
          team_id: string;
          throws: string | null;
          town: string | null;
          twitter_handle: string | null;
        };
        Insert: {
          bats?: string | null;
          created_at?: string;
          first_name: string;
          gpa?: number | null;
          grad_year?: number | null;
          headshot_url?: string | null;
          height?: string | null;
          id?: string;
          jersey_number?: number | null;
          last_name: string;
          position?: string | null;
          school?: string | null;
          status?: string;
          team_id: string;
          throws?: string | null;
          town?: string | null;
          twitter_handle?: string | null;
        };
        Update: {
          bats?: string | null;
          created_at?: string;
          first_name?: string;
          gpa?: number | null;
          grad_year?: number | null;
          headshot_url?: string | null;
          height?: string | null;
          id?: string;
          jersey_number?: number | null;
          last_name?: string;
          position?: string | null;
          school?: string | null;
          status?: string;
          team_id?: string;
          throws?: string | null;
          town?: string | null;
          twitter_handle?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      schedule_events: {
        Row: {
          created_at: string;
          end_time: string | null;
          event_date: string;
          event_name: string;
          event_type: string | null;
          id: string;
          is_home: boolean | null;
          location: string | null;
          notes: string | null;
          sanction: string | null;
          start_time: string | null;
          team_id: string;
        };
        Insert: {
          created_at?: string;
          end_time?: string | null;
          event_date: string;
          event_name: string;
          event_type?: string | null;
          id?: string;
          is_home?: boolean | null;
          location?: string | null;
          notes?: string | null;
          sanction?: string | null;
          start_time?: string | null;
          team_id: string;
        };
        Update: {
          created_at?: string;
          end_time?: string | null;
          event_date?: string;
          event_name?: string;
          event_type?: string | null;
          id?: string;
          is_home?: boolean | null;
          location?: string | null;
          notes?: string | null;
          sanction?: string | null;
          start_time?: string | null;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedule_events_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      static_pages: {
        Row: {
          content: Json | null;
          created_at: string;
          id: string;
          meta_description: string | null;
          published: boolean | null;
          slug: string;
          title: string;
        };
        Insert: {
          content?: Json | null;
          created_at?: string;
          id?: string;
          meta_description?: string | null;
          published?: boolean | null;
          slug: string;
          title: string;
        };
        Update: {
          content?: Json | null;
          created_at?: string;
          id?: string;
          meta_description?: string | null;
          published?: boolean | null;
          slug?: string;
          title?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          primary_color: string | null;
          season: string | null;
          secondary_color: string | null;
          team_image_url: string | null;
          year: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          primary_color?: string | null;
          season?: string | null;
          secondary_color?: string | null;
          team_image_url?: string | null;
          year?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          primary_color?: string | null;
          season?: string | null;
          secondary_color?: string | null;
          team_image_url?: string | null;
          year?: number | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: string;
          team_id: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          role: string;
          team_id?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          role?: string;
          team_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
