type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Database = {
  public: {
    Tables: {
      // ── restaurants ─────────────────────────────────────────
      restaurants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          currency: string;
          timezone: string;
          country_code: string;
          is_active: boolean;
          trial_ends_at: string | null;
          subscribed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          currency?: string;
          timezone?: string;
          country_code?: string;
          is_active?: boolean;
          trial_ends_at?: string | null;
          subscribed_at?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          currency?: string;
          timezone?: string;
          is_active?: boolean;
          trial_ends_at?: string | null;
          subscribed_at?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      // ── restaurant_settings ─────────────────────────────────
      restaurant_settings: {
        Row: {
          id: string;
          restaurant_id: string;
          require_table_open: boolean;
          auto_confirm_orders: boolean;
          tax_percentage: number;
          service_charge_percentage: number;
          tax_inclusive: boolean;
          receipt_header: string | null;
          receipt_footer: string | null;
          show_tax_on_receipt: boolean;
          show_service_on_receipt: boolean;
          operating_hours: Json | null;
          sound_alert_enabled: boolean;
          kitchen_display_enabled: boolean;
          printer_enabled: boolean;
          printer_ip: string | null;
          printer_port: number | null;
          paper_size: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          require_table_open?: boolean;
          auto_confirm_orders?: boolean;
          tax_percentage?: number;
          service_charge_percentage?: number;
          tax_inclusive?: boolean;
          receipt_header?: string | null;
          receipt_footer?: string | null;
          show_tax_on_receipt?: boolean;
          show_service_on_receipt?: boolean;
          operating_hours?: Json | null;
          sound_alert_enabled?: boolean;
          kitchen_display_enabled?: boolean;
          printer_enabled?: boolean;
          printer_ip?: string | null;
          printer_port?: number | null;
          paper_size?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["restaurant_settings"]["Insert"]
        >;
      };

      // ── restaurant_members ──────────────────────────────────
      restaurant_members: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          role: "owner" | "manager" | "floor_staff" | "cashier" | "kitchen";
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          role?: "owner" | "manager" | "floor_staff" | "cashier" | "kitchen";
          is_active?: boolean;
        };
        Update: {
          role?: "owner" | "manager" | "floor_staff" | "cashier" | "kitchen";
          is_active?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      // ── user_profiles ───────────────────────────────────────
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          pin_hash: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string; // must match auth.users.id
          full_name: string;
          avatar_url?: string | null;
          pin_hash?: string | null;
          is_active?: boolean;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          pin_hash?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      // ── table_zones ─────────────────────────────────────────
      table_zones: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          sort_order?: number;
        };
      };

      // ── tables ──────────────────────────────────────────────
      tables: {
        Row: {
          id: string;
          restaurant_id: string;
          zone_id: string | null;
          name: string;
          slug: string;
          capacity: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          zone_id?: string | null;
          name: string;
          slug: string;
          capacity?: number | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          zone_id?: string | null;
          name?: string;
          slug?: string;
          capacity?: number | null;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      // ── qr_codes ────────────────────────────────────────────
      qr_codes: {
        Row: {
          id: string;
          table_id: string;
          restaurant_id: string;
          token: string;
          is_active: boolean;
          generated_by: string | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          restaurant_id: string;
          token?: string;
          is_active?: boolean;
          generated_by?: string | null;
        };
        Update: {
          is_active?: boolean;
        };
      };

      // ── table_sessions ──────────────────────────────────────
      table_sessions: {
        Row: {
          id: string;
          table_id: string;
          restaurant_id: string;
          opened_by: string | null;
          closed_by: string | null;
          status: "open" | "bill_requested" | "closed" | "moved" | "merged";
          guest_count: number | null;
          bill_requested_at: string | null;
          opened_at: string;
          closed_at: string | null;
          parent_session_id: string | null;
          moved_from_table_id: string | null;
          moved_at: string | null;
        };
        Insert: {
          id?: string;
          table_id: string;
          restaurant_id: string;
          opened_by?: string | null;
          status?: "open" | "bill_requested" | "closed" | "moved" | "merged";
          guest_count?: number | null;
          parent_session_id?: string | null;
        };
        Update: {
          closed_by?: string | null;
          status?: "open" | "bill_requested" | "closed" | "moved" | "merged";
          guest_count?: number | null;
          bill_requested_at?: string | null;
          closed_at?: string | null;
          moved_from_table_id?: string | null;
          moved_at?: string | null;
        };
      };

      // ── menus ───────────────────────────────────────────────
      menus: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name?: string;
          is_default?: boolean;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          is_default?: boolean;
          is_active?: boolean;
          deleted_at?: string | null;
        };
      };

      // ── menu_categories ─────────────────────────────────────
      menu_categories: {
        Row: {
          id: string;
          menu_id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          menu_id: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          deleted_at?: string | null;
        };
      };

      // ── menu_items ──────────────────────────────────────────
      menu_items: {
        Row: {
          id: string;
          category_id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          base_price: number;
          is_available: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          base_price: number;
          is_available?: boolean;
          is_featured?: boolean;
          sort_order?: number;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          base_price?: number;
          is_available?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
        };
      };

      // ── menu_item_variants ──────────────────────────────────
      menu_item_variants: {
        Row: {
          id: string;
          menu_item_id: string;
          restaurant_id: string;
          group_name: string;
          option_name: string;
          price_modifier: number;
          is_required: boolean;
          is_available: boolean;
          sort_order: number;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          restaurant_id: string;
          group_name: string;
          option_name: string;
          price_modifier?: number;
          is_required?: boolean;
          is_available?: boolean;
          sort_order?: number;
        };
        Update: {
          group_name?: string;
          option_name?: string;
          price_modifier?: number;
          is_required?: boolean;
          is_available?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
        };
      };

      // ── menu_item_modifiers ─────────────────────────────────
      menu_item_modifiers: {
        Row: {
          id: string;
          menu_item_id: string;
          restaurant_id: string;
          name: string;
          price_modifier: number;
          is_available: boolean;
          sort_order: number;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          restaurant_id: string;
          name: string;
          price_modifier?: number;
          is_available?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          price_modifier?: number;
          is_available?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
        };
      };

      // ── orders ──────────────────────────────────────────────
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          table_id: string;
          session_id: string;
          order_number: string;
          status:
            | "pending"
            | "confirmed"
            | "preparing"
            | "ready"
            | "served"
            | "cancelled";
          customer_note: string | null;
          subtotal: number;
          tax_amount: number;
          service_amount: number;
          discount_amount: number;
          total_amount: number;
          tax_rate_snapshot: number;
          service_rate_snapshot: number;
          confirmed_by: string | null;
          confirmed_at: string | null;
          cancelled_by: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          table_id: string;
          session_id: string;
          order_number?: string; // auto-generated by trigger
          status?:
            | "pending"
            | "confirmed"
            | "preparing"
            | "ready"
            | "served"
            | "cancelled";
          customer_note?: string | null;
          discount_amount?: number; // totals calculated by trigger
        };
        Update: {
          status?:
            | "pending"
            | "confirmed"
            | "preparing"
            | "ready"
            | "served"
            | "cancelled";
          customer_note?: string | null;
          discount_amount?: number;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          cancelled_by?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
        };
      };

      // ── order_items ─────────────────────────────────────────
      order_items: {
        Row: {
          id: string;
          order_id: string;
          restaurant_id: string;
          menu_item_id: string | null;
          item_name: string;
          item_image_url: string | null;
          unit_price: number;
          quantity: number;
          subtotal: number;
          item_note: string | null;
          kitchen_status: "queued" | "preparing" | "ready" | "served";
          kitchen_ready_at: string | null;
          served_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          restaurant_id: string;
          menu_item_id?: string | null;
          item_name: string; // snapshot — required
          item_image_url?: string | null;
          unit_price: number; // snapshot — required
          quantity: number;
          subtotal: number; // = unit_price × quantity
          item_note?: string | null;
          kitchen_status?: "queued" | "preparing" | "ready" | "served";
        };
        Update: {
          quantity?: number;
          item_note?: string | null;
          kitchen_status?: "queued" | "preparing" | "ready" | "served";
          kitchen_ready_at?: string | null;
          served_at?: string | null;
        };
      };

      // ── order_item_variants ─────────────────────────────────
      order_item_variants: {
        Row: {
          id: string;
          order_item_id: string;
          variant_id: string | null;
          group_name: string;
          option_name: string;
          price_modifier: number;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          variant_id?: string | null;
          group_name: string;
          option_name: string;
          price_modifier?: number;
        };
        Update: never; // snapshots are immutable
      };

      // ── order_item_modifiers ────────────────────────────────
      order_item_modifiers: {
        Row: {
          id: string;
          order_item_id: string;
          modifier_id: string | null;
          modifier_name: string;
          price_modifier: number;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          modifier_id?: string | null;
          modifier_name: string;
          price_modifier?: number;
        };
        Update: never; // snapshots are immutable
      };

      // ── payments ────────────────────────────────────────────
      payments: {
        Row: {
          id: string;
          restaurant_id: string;
          session_id: string;
          payment_method: "cash" | "card" | "ewallet" | "transfer" | "other";
          payment_reference: string | null;
          subtotal: number;
          tax_amount: number;
          service_amount: number;
          discount_amount: number;
          total_amount: number;
          amount_tendered: number | null;
          change_given: number | null;
          discount_type: "percentage" | "fixed" | null;
          discount_value: number | null;
          discount_reason: string | null;
          discount_applied_by: string | null;
          processed_by: string | null;
          status: "completed" | "voided";
          voided_by: string | null;
          voided_at: string | null;
          void_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          session_id: string;
          payment_method: "cash" | "card" | "ewallet" | "transfer" | "other";
          payment_reference?: string | null;
          subtotal: number;
          tax_amount: number;
          service_amount: number;
          discount_amount?: number;
          total_amount: number;
          amount_tendered?: number | null;
          change_given?: number | null;
          discount_type?: "percentage" | "fixed" | null;
          discount_value?: number | null;
          discount_reason?: string | null;
          discount_applied_by?: string | null;
          processed_by?: string | null;
          status?: "completed" | "voided";
        };
        Update: {
          status?: "completed" | "voided";
          voided_by?: string | null;
          voided_at?: string | null;
          void_reason?: string | null;
        };
      };

      // ── receipts ────────────────────────────────────────────
      receipts: {
        Row: {
          id: string;
          payment_id: string;
          restaurant_id: string;
          receipt_number: string;
          receipt_data: Json;
          view_token: string;
          printed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          restaurant_id: string;
          receipt_number: string;
          receipt_data: Json;
          view_token?: string;
          printed_at?: string | null;
        };
        Update: {
          printed_at?: string | null;
        };
      };

      // ── notifications ───────────────────────────────────────
      notifications: {
        Row: {
          id: string;
          restaurant_id: string;
          target_role: string | null;
          target_user_id: string | null;
          type: string;
          title: string;
          body: string | null;
          data: Json | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          target_role?: string | null;
          target_user_id?: string | null;
          type: string;
          title: string;
          body?: string | null;
          data?: Json | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
          read_at?: string | null;
        };
      };

      // ── activity_logs ───────────────────────────────────────
      activity_logs: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: never; // logs are immutable
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      auth_restaurant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      auth_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      auth_has_role: {
        Args: { roles: string[] };
        Returns: boolean;
      };
      custom_jwt_claims: {
        Args: { event: Json };
        Returns: Json;
      };
    };

    Enums: {
      [_ in never]: never;
    };
  };
};

// ─── Convenience type aliases ─────────────────────────────────

type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Individual table row types (import these in components)
type Restaurant = Tables<"restaurants">;
type RestaurantSettings = Tables<"restaurant_settings">;
type RestaurantMember = Tables<"restaurant_members">;
type UserProfile = Tables<"user_profiles">;
type TableZone = Tables<"table_zones">;
type Table = Tables<"tables">;
type QRCode = Tables<"qr_codes">;
type TableSession = Tables<"table_sessions">;
type Menu = Tables<"menus">;
type MenuCategory = Tables<"menu_categories">;
type MenuItem = Tables<"menu_items">;
type MenuItemVariant = Tables<"menu_item_variants">;
type MenuItemModifier = Tables<"menu_item_modifiers">;
type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;
type OrderItemVariant = Tables<"order_item_variants">;
type OrderItemModifier = Tables<"order_item_modifiers">;
type Payment = Tables<"payments">;
type Receipt = Tables<"receipts">;
type Notification = Tables<"notifications">;
type ActivityLog = Tables<"activity_logs">;

// Status enums (use these instead of raw strings)
type OrderStatus = Order["status"];
type SessionStatus = TableSession["status"];
type KitchenStatus = OrderItem["kitchen_status"];
type UserRole = RestaurantMember["role"];
type PaymentMethod = Payment["payment_method"];
