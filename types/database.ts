/**
 * Hand-written types mirroring the live Supabase schema (same project as the
 * public website — see supabase/migrations/0001-0005). Regenerate with
 * `supabase gen types typescript` once the project is linked, and keep this
 * file in sync if you edit the schema by hand in the meantime.
 */

export type InfluencerStatus = "active" | "inactive";
export type ReferralCodeStatus = "available" | "used" | "disabled";
export type EmailStatus = "pending" | "sent" | "failed";
export type EventStatus = "upcoming" | "past";
export type AdminRole = "platform_admin" | "event_manager" | "moderator" | "quest_staff";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type MemberRole =
  | "fan"
  | "parent_guardian"
  | "creator"
  | "competitor"
  | "vendor"
  | "instructor"
  | "influencer";

export interface Database {
  public: {
    Tables: {
      influencers: {
        Row: {
          id: string;
          display_name: string;
          contact: string | null;
          status: InfluencerStatus;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          display_name: string;
          contact?: string | null;
          status?: InfluencerStatus;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["influencers"]["Insert"]>;
        Relationships: [];
      };
      referral_codes: {
        Row: {
          id: string;
          code: string;
          influencer_id: string;
          status: ReferralCodeStatus;
          discount_percent: number;
          commission_percent: number;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          influencer_id: string;
          status?: ReferralCodeStatus;
          discount_percent?: number;
          commission_percent?: number;
          created_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["referral_codes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "referral_codes_influencer_id_fkey";
            columns: ["influencer_id"];
            isOneToOne: false;
            referencedRelation: "influencers";
            referencedColumns: ["id"];
          },
        ];
      };
      // Renamed from `redemptions` (0003_ticket_purchases.sql): referral codes
      // are now reusable discount codes, so this is one row per ticket
      // purchase intent rather than one row per single-use redemption.
      ticket_orders: {
        Row: {
          id: string;
          event_id: string | null;
          referral_code_id: string | null;
          buyer_name: string;
          buyer_email: string;
          unit_price_cents: number;
          discount_cents: number;
          commission_cents: number;
          total_cents: number;
          currency: string;
          confirmation_ref: string;
          email_status: EmailStatus;
          payment_provider: string;
          payment_token: string | null;
          payment_ref: string | null;
          payment_status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          referral_code_id?: string | null;
          buyer_name: string;
          buyer_email: string;
          unit_price_cents?: number;
          discount_cents?: number;
          commission_cents?: number;
          total_cents?: number;
          currency?: string;
          confirmation_ref?: string;
          email_status?: EmailStatus;
          payment_provider?: string;
          payment_token?: string | null;
          payment_ref?: string | null;
          payment_status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ticket_orders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "ticket_orders_referral_code_id_fkey";
            columns: ["referral_code_id"];
            isOneToOne: false;
            referencedRelation: "referral_codes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ticket_orders_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          event_date: string;
          venue: string;
          schedule: unknown;
          ticket_url: string | null;
          price_cents: number;
          currency: string;
          status: EventStatus;
          is_published: boolean;
          cover_image: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          event_date: string;
          venue: string;
          schedule?: unknown;
          ticket_url?: string | null;
          price_cents?: number;
          currency?: string;
          status?: EventStatus;
          is_published?: boolean;
          cover_image?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      // One row per auth.users member who finished profile setup on the
      // public site (0002_profiles_and_quest.sql). Email lives on
      // auth.users, not here — see getMembers() in lib/data/admin.ts.
      profiles: {
        Row: {
          id: string;
          display_name: string;
          role: MemberRole;
          bio: string | null;
          interests: string[];
          details: unknown;
          marketing_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role?: MemberRole;
          bio?: string | null;
          interests?: string[];
          details?: unknown;
          marketing_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      fan_passes: {
        Row: {
          id: string;
          pass_code: string;
          holder_name: string;
          holder_email: string | null;
          xp: number;
          badge: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pass_code?: string;
          holder_name: string;
          holder_email?: string | null;
          xp?: number;
          badge?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fan_passes"]["Insert"]>;
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AdminRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          details: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          details?: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_ticket_order: {
        Args: {
          p_event_slug: string;
          p_buyer_name: string;
          p_buyer_email: string;
          p_code?: string | null;
        };
        Returns: {
          order_id: string;
          confirmation_ref: string;
          influencer_name: string | null;
          unit_price_cents: number;
          discount_cents: number;
          total_cents: number;
          currency: string;
        }[];
      };
      mark_ticket_order_email_status: {
        Args: { p_order_id: string; p_status: EmailStatus };
        Returns: void;
      };
      get_fan_pass: {
        Args: { p_pass_code: string };
        Returns: {
          pass_code: string;
          holder_name: string;
          xp: number;
          badge: string | null;
          created_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
