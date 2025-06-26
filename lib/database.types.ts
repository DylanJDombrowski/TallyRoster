export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
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
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
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
