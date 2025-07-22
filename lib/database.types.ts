export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alumni: {
        Row: {
          college: string | null
          college_logo_url: string | null
          created_at: string
          grad_year: number
          high_school: string | null
          hs_logo_url: string | null
          id: string
          image_url: string | null
          organization_id: string | null
          player_id: string | null
          player_name: string
          position: string | null
          xpress_team: string | null
        }
        Insert: {
          college?: string | null
          college_logo_url?: string | null
          created_at?: string
          grad_year: number
          high_school?: string | null
          hs_logo_url?: string | null
          id?: string
          image_url?: string | null
          organization_id?: string | null
          player_id?: string | null
          player_name: string
          position?: string | null
          xpress_team?: string | null
        }
        Update: {
          college?: string | null
          college_logo_url?: string | null
          created_at?: string
          grad_year?: number
          high_school?: string | null
          hs_logo_url?: string | null
          id?: string
          image_url?: string | null
          organization_id?: string | null
          player_id?: string | null
          player_name?: string
          position?: string | null
          xpress_team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumni_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumni_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          location: string | null
          organization_id: string
          place: string | null
          published_date: string
          season: string | null
          short_description: string | null
          slug: string
          status: string
          team_name: string | null
          title: string
          tournament_name: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          organization_id: string
          place?: string | null
          published_date: string
          season?: string | null
          short_description?: string | null
          slug: string
          status?: string
          team_name?: string | null
          title: string
          tournament_name?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string | null
          organization_id?: string
          place?: string | null
          published_date?: string
          season?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          team_name?: string | null
          title?: string
          tournament_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          image_url: string | null
          name: string
          order_index: number | null
          phone: string | null
          position: string | null
          team_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name: string
          order_index?: number | null
          phone?: string | null
          position?: string | null
          team_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number | null
          phone?: string | null
          position?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_deliveries: {
        Row: {
          clicked_at: string | null
          communication_id: string
          created_at: string | null
          delivered_at: string | null
          delivery_channel: string
          error_message: string | null
          external_message_id: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          recipient_type: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          clicked_at?: string | null
          communication_id: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel: string
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          clicked_at?: string | null
          communication_id?: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel?: string
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_deliveries_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_groups: {
        Row: {
          auto_managed: boolean | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          team_id: string | null
        }
        Insert: {
          auto_managed?: boolean | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          team_id?: string | null
        }
        Update: {
          auto_managed?: boolean | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_groups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          content_template: string | null
          created_at: string | null
          created_by: string
          id: string
          is_system_template: boolean | null
          name: string
          organization_id: string
          subject_template: string | null
          template_type: string | null
        }
        Insert: {
          content_template?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_system_template?: boolean | null
          name: string
          organization_id: string
          subject_template?: string | null
          template_type?: string | null
        }
        Update: {
          content_template?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_system_template?: boolean | null
          name?: string
          organization_id?: string
          subject_template?: string | null
          template_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          organization_id: string
          priority: string | null
          scheduled_send_at: string | null
          send_email: boolean | null
          send_push: boolean | null
          send_sms: boolean | null
          sender_id: string
          sent_at: string | null
          subject: string
          target_all_org: boolean | null
          target_groups: string[] | null
          target_individuals: string[] | null
          target_teams: string[] | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          organization_id: string
          priority?: string | null
          scheduled_send_at?: string | null
          send_email?: boolean | null
          send_push?: boolean | null
          send_sms?: boolean | null
          sender_id: string
          sent_at?: string | null
          subject: string
          target_all_org?: boolean | null
          target_groups?: string[] | null
          target_individuals?: string[] | null
          target_teams?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          organization_id?: string
          priority?: string | null
          scheduled_send_at?: string | null
          send_email?: boolean | null
          send_push?: boolean | null
          send_sms?: boolean | null
          sender_id?: string
          sent_at?: string | null
          subject?: string
          target_all_org?: boolean | null
          target_groups?: string[] | null
          target_individuals?: string[] | null
          target_teams?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number | null
          created_at: string | null
          game_date: string
          home_score: number | null
          id: string
          inning: number | null
          is_home: boolean | null
          location: string | null
          opponent: string
          organization_id: string | null
          status: string | null
          team_id: string | null
        }
        Insert: {
          away_score?: number | null
          created_at?: string | null
          game_date: string
          home_score?: number | null
          id?: string
          inning?: number | null
          is_home?: boolean | null
          location?: string | null
          opponent: string
          organization_id?: string | null
          status?: string | null
          team_id?: string | null
        }
        Update: {
          away_score?: number | null
          created_at?: string | null
          game_date?: string
          home_score?: number | null
          id?: string
          inning?: number | null
          is_home?: boolean | null
          location?: string | null
          opponent?: string
          organization_id?: string | null
          status?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          active: boolean | null
          added_at: string | null
          email: string
          group_id: string
          id: string
          member_name: string | null
          member_type: string
          phone: string | null
          player_id: string | null
        }
        Insert: {
          active?: boolean | null
          added_at?: string | null
          email: string
          group_id: string
          id?: string
          member_name?: string | null
          member_type: string
          phone?: string | null
          player_id?: string | null
        }
        Update: {
          active?: boolean | null
          added_at?: string | null
          email?: string
          group_id?: string
          id?: string
          member_name?: string | null
          member_type?: string
          phone?: string | null
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "communication_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          code: string
          created_at: string
          created_by: string
          current_uses: number | null
          expires_at: string
          id: string
          max_uses: number | null
          organization_id: string
          role: string
          used: boolean
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          current_uses?: number | null
          expires_at: string
          id?: string
          max_uses?: number | null
          organization_id: string
          role: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          current_uses?: number | null
          expires_at?: string
          id?: string
          max_uses?: number | null
          organization_id?: string
          role?: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_links: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          organization_id: string
          position: number | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id: string
          position?: number | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          position?: number | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          domain_added: boolean | null
          domain_added_at: string | null
          domain_ssl_status: string | null
          domain_verification_method: string | null
          domain_verification_token: string | null
          domain_verified: boolean | null
          id: string
          logo_url: string | null
          name: string
          organization_type: string | null
          owner_id: string | null
          primary_color: string | null
          secondary_color: string | null
          slogan: string | null
          sport: string | null
          subdomain: string | null
          subscription_plan: string | null
          theme: string | null
          trial_ends_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          domain_added?: boolean | null
          domain_added_at?: string | null
          domain_ssl_status?: string | null
          domain_verification_method?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          organization_type?: string | null
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slogan?: string | null
          sport?: string | null
          subdomain?: string | null
          subscription_plan?: string | null
          theme?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          domain_added?: boolean | null
          domain_added_at?: string | null
          domain_ssl_status?: string | null
          domain_verification_method?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          organization_type?: string | null
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slogan?: string | null
          sport?: string | null
          subdomain?: string | null
          subscription_plan?: string | null
          theme?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          logo_url: string | null
          name: string
          partner_type: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name: string
          partner_type?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          partner_type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          batting_avg: number | null
          created_at: string
          era: number | null
          games_played: number | null
          hits: number | null
          home_runs: number | null
          id: string
          losses: number | null
          player_id: string
          rbis: number | null
          runs: number | null
          season: string | null
          wins: number | null
        }
        Insert: {
          batting_avg?: number | null
          created_at?: string
          era?: number | null
          games_played?: number | null
          hits?: number | null
          home_runs?: number | null
          id?: string
          losses?: number | null
          player_id: string
          rbis?: number | null
          runs?: number | null
          season?: string | null
          wins?: number | null
        }
        Update: {
          batting_avg?: number | null
          created_at?: string
          era?: number | null
          games_played?: number | null
          hits?: number | null
          home_runs?: number | null
          id?: string
          losses?: number | null
          player_id?: string
          rbis?: number | null
          runs?: number | null
          season?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          bats: string | null
          created_at: string
          emergency_contact_email: string | null
          first_name: string
          gpa: number | null
          grad_year: number | null
          headshot_url: string | null
          height: string | null
          id: string
          jersey_number: number | null
          last_name: string
          organization_id: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          player_email: string | null
          position: string | null
          school: string | null
          status: string
          team_id: string
          throws: string | null
          town: string | null
          twitter_handle: string | null
        }
        Insert: {
          bats?: string | null
          created_at?: string
          emergency_contact_email?: string | null
          first_name: string
          gpa?: number | null
          grad_year?: number | null
          headshot_url?: string | null
          height?: string | null
          id?: string
          jersey_number?: number | null
          last_name: string
          organization_id: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          player_email?: string | null
          position?: string | null
          school?: string | null
          status?: string
          team_id: string
          throws?: string | null
          town?: string | null
          twitter_handle?: string | null
        }
        Update: {
          bats?: string | null
          created_at?: string
          emergency_contact_email?: string | null
          first_name?: string
          gpa?: number | null
          grad_year?: number | null
          headshot_url?: string | null
          height?: string | null
          id?: string
          jersey_number?: number | null
          last_name?: string
          organization_id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          player_email?: string | null
          position?: string | null
          school?: string | null
          status?: string
          team_id?: string
          throws?: string | null
          town?: string | null
          twitter_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_events: {
        Row: {
          created_at: string
          end_time: string | null
          event_date: string
          event_name: string
          event_type: string | null
          id: string
          is_home: boolean | null
          location: string | null
          notes: string | null
          sanction: string | null
          start_time: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          event_date: string
          event_name: string
          event_type?: string | null
          id?: string
          is_home?: boolean | null
          location?: string | null
          notes?: string | null
          sanction?: string | null
          start_time?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          event_date?: string
          event_name?: string
          event_type?: string | null
          id?: string
          is_home?: boolean | null
          location?: string | null
          notes?: string | null
          sanction?: string | null
          start_time?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      static_pages: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          meta_description: string | null
          published: boolean | null
          slug: string
          title: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          meta_description?: string | null
          published?: boolean | null
          slug: string
          title: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          meta_description?: string | null
          published?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string | null
          primary_color: string | null
          season: string | null
          secondary_color: string | null
          team_image_url: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          primary_color?: string | null
          season?: string | null
          secondary_color?: string | null
          team_image_url?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          primary_color?: string | null
          season?: string | null
          secondary_color?: string | null
          team_image_url?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organization_roles: {
        Row: {
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
