export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          restaurant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          restaurant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          restaurant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_visible: boolean
          menu_id: string
          name: string
          restaurant_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          menu_id: string
          name: string
          restaurant_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          menu_id?: string
          name?: string
          restaurant_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_modifiers: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_available: boolean
          menu_item_id: string
          name: string
          price_modifier: number
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_available?: boolean
          menu_item_id: string
          name: string
          price_modifier?: number
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_available?: boolean
          menu_item_id?: string
          name?: string
          price_modifier?: number
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_modifiers_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_modifiers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variants: {
        Row: {
          created_at: string
          deleted_at: string | null
          group_name: string
          id: string
          is_available: boolean
          is_required: boolean
          menu_item_id: string
          option_name: string
          price_modifier: number
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          group_name: string
          id?: string
          is_available?: boolean
          is_required?: boolean
          menu_item_id: string
          option_name: string
          price_modifier?: number
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          group_name?: string
          id?: string
          is_available?: boolean
          is_required?: boolean
          menu_item_id?: string
          option_name?: string
          price_modifier?: number
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_variants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          base_price: number
          category_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          name: string
          restaurant_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          category_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          name: string
          restaurant_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          name?: string
          restaurant_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          read_at: string | null
          restaurant_id: string
          target_role: string | null
          target_user_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          restaurant_id: string
          target_role?: string | null
          target_user_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          restaurant_id?: string
          target_role?: string | null
          target_user_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_modifiers: {
        Row: {
          id: string
          modifier_id: string | null
          modifier_name: string
          order_item_id: string
          price_modifier: number
        }
        Insert: {
          id?: string
          modifier_id?: string | null
          modifier_name: string
          order_item_id: string
          price_modifier?: number
        }
        Update: {
          id?: string
          modifier_id?: string | null
          modifier_name?: string
          order_item_id?: string
          price_modifier?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_modifiers_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "menu_item_modifiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_modifiers_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_variants: {
        Row: {
          group_name: string
          id: string
          option_name: string
          order_item_id: string
          price_modifier: number
          variant_id: string | null
        }
        Insert: {
          group_name: string
          id?: string
          option_name: string
          order_item_id: string
          price_modifier?: number
          variant_id?: string | null
        }
        Update: {
          group_name?: string
          id?: string
          option_name?: string
          order_item_id?: string
          price_modifier?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_item_variants_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_variants_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_item_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_image_url: string | null
          item_name: string
          item_note: string | null
          kitchen_ready_at: string | null
          kitchen_status: string
          menu_item_id: string | null
          order_id: string
          quantity: number
          restaurant_id: string
          served_at: string | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_image_url?: string | null
          item_name: string
          item_note?: string | null
          kitchen_ready_at?: string | null
          kitchen_status?: string
          menu_item_id?: string | null
          order_id: string
          quantity?: number
          restaurant_id: string
          served_at?: string | null
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_image_url?: string | null
          item_name?: string
          item_note?: string | null
          kitchen_ready_at?: string | null
          kitchen_status?: string
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          restaurant_id?: string
          served_at?: string | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          customer_note: string | null
          discount_amount: number
          id: string
          order_number: string
          restaurant_id: string
          service_amount: number
          service_rate_snapshot: number
          session_id: string
          status: string
          subtotal: number
          table_id: string
          tax_amount: number
          tax_rate_snapshot: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          customer_note?: string | null
          discount_amount?: number
          id?: string
          order_number?: string
          restaurant_id: string
          service_amount?: number
          service_rate_snapshot?: number
          session_id: string
          status?: string
          subtotal?: number
          table_id: string
          tax_amount?: number
          tax_rate_snapshot?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          customer_note?: string | null
          discount_amount?: number
          id?: string
          order_number?: string
          restaurant_id?: string
          service_amount?: number
          service_rate_snapshot?: number
          session_id?: string
          status?: string
          subtotal?: number
          table_id?: string
          tax_amount?: number
          tax_rate_snapshot?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_tendered: number | null
          change_given: number | null
          created_at: string
          discount_amount: number
          discount_applied_by: string | null
          discount_reason: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          payment_method: string
          payment_reference: string | null
          processed_by: string | null
          restaurant_id: string
          service_amount: number
          session_id: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount_tendered?: number | null
          change_given?: number | null
          created_at?: string
          discount_amount?: number
          discount_applied_by?: string | null
          discount_reason?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          payment_method: string
          payment_reference?: string | null
          processed_by?: string | null
          restaurant_id: string
          service_amount?: number
          session_id: string
          status?: string
          subtotal: number
          tax_amount?: number
          total_amount: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount_tendered?: number | null
          change_given?: number | null
          created_at?: string
          discount_amount?: number
          discount_applied_by?: string | null
          discount_reason?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          payment_method?: string
          payment_reference?: string | null
          processed_by?: string | null
          restaurant_id?: string
          service_amount?: number
          session_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_discount_applied_by_fkey"
            columns: ["discount_applied_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          generated_at: string
          generated_by: string | null
          id: string
          is_active: boolean
          restaurant_id: string
          table_id: string
          token: string
        }
        Insert: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          is_active?: boolean
          restaurant_id: string
          table_id: string
          token?: string
        }
        Update: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          is_active?: boolean
          restaurant_id?: string
          table_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          id: string
          payment_id: string
          printed_at: string | null
          receipt_data: Json
          receipt_number: string
          restaurant_id: string
          view_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_id: string
          printed_at?: string | null
          receipt_data: Json
          receipt_number: string
          restaurant_id: string
          view_token?: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_id?: string
          printed_at?: string | null
          receipt_data?: Json
          receipt_number?: string
          restaurant_id?: string
          view_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          auto_confirm_orders: boolean
          id: string
          kitchen_display_enabled: boolean
          operating_hours: Json | null
          paper_size: string | null
          printer_enabled: boolean
          printer_ip: string | null
          printer_port: number | null
          receipt_footer: string | null
          receipt_header: string | null
          require_table_open: boolean
          restaurant_id: string
          service_charge_percentage: number
          show_service_on_receipt: boolean
          show_tax_on_receipt: boolean
          sound_alert_enabled: boolean
          tax_inclusive: boolean
          tax_percentage: number
          updated_at: string
        }
        Insert: {
          auto_confirm_orders?: boolean
          id?: string
          kitchen_display_enabled?: boolean
          operating_hours?: Json | null
          paper_size?: string | null
          printer_enabled?: boolean
          printer_ip?: string | null
          printer_port?: number | null
          receipt_footer?: string | null
          receipt_header?: string | null
          require_table_open?: boolean
          restaurant_id: string
          service_charge_percentage?: number
          show_service_on_receipt?: boolean
          show_tax_on_receipt?: boolean
          sound_alert_enabled?: boolean
          tax_inclusive?: boolean
          tax_percentage?: number
          updated_at?: string
        }
        Update: {
          auto_confirm_orders?: boolean
          id?: string
          kitchen_display_enabled?: boolean
          operating_hours?: Json | null
          paper_size?: string | null
          printer_enabled?: boolean
          printer_ip?: string | null
          printer_port?: number | null
          receipt_footer?: string | null
          receipt_header?: string | null
          require_table_open?: boolean
          restaurant_id?: string
          service_charge_percentage?: number
          show_service_on_receipt?: boolean
          show_tax_on_receipt?: boolean
          sound_alert_enabled?: boolean
          tax_inclusive?: boolean
          tax_percentage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          country_code: string
          created_at: string
          currency: string
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          subscribed_at: string | null
          timezone: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          country_code?: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          subscribed_at?: string | null
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          country_code?: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          subscribed_at?: string | null
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      table_moves: {
        Row: {
          from_session_id: string
          from_table_id: string
          id: string
          move_reason: string | null
          move_type: string
          moved_at: string
          moved_by: string | null
          orders_moved: number
          restaurant_id: string
          to_session_id: string
          to_table_id: string
        }
        Insert: {
          from_session_id: string
          from_table_id: string
          id?: string
          move_reason?: string | null
          move_type?: string
          moved_at?: string
          moved_by?: string | null
          orders_moved?: number
          restaurant_id: string
          to_session_id: string
          to_table_id: string
        }
        Update: {
          from_session_id?: string
          from_table_id?: string
          id?: string
          move_reason?: string | null
          move_type?: string
          moved_at?: string
          moved_by?: string | null
          orders_moved?: number
          restaurant_id?: string
          to_session_id?: string
          to_table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_moves_from_session_id_fkey"
            columns: ["from_session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_moves_from_table_id_fkey"
            columns: ["from_table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_moves_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_moves_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_moves_to_session_id_fkey"
            columns: ["to_session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_moves_to_table_id_fkey"
            columns: ["to_table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sessions: {
        Row: {
          bill_requested_at: string | null
          closed_at: string | null
          closed_by: string | null
          guest_count: number | null
          id: string
          moved_at: string | null
          moved_from_table_id: string | null
          opened_at: string
          opened_by: string | null
          parent_session_id: string | null
          restaurant_id: string
          status: string
          table_id: string
        }
        Insert: {
          bill_requested_at?: string | null
          closed_at?: string | null
          closed_by?: string | null
          guest_count?: number | null
          id?: string
          moved_at?: string | null
          moved_from_table_id?: string | null
          opened_at?: string
          opened_by?: string | null
          parent_session_id?: string | null
          restaurant_id: string
          status?: string
          table_id: string
        }
        Update: {
          bill_requested_at?: string | null
          closed_at?: string | null
          closed_by?: string | null
          guest_count?: number | null
          id?: string
          moved_at?: string | null
          moved_from_table_id?: string | null
          opened_at?: string
          opened_by?: string | null
          parent_session_id?: string | null
          restaurant_id?: string
          status?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_moved_from_table_id_fkey"
            columns: ["moved_from_table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_parent_session_id_fkey"
            columns: ["parent_session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_zones: {
        Row: {
          created_at: string
          id: string
          name: string
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "table_zones_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          restaurant_id: string
          slug: string
          sort_order: number
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          restaurant_id: string
          slug: string
          sort_order?: number
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          restaurant_id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "table_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          pin_hash: string | null
          restaurant_id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          pin_hash?: string | null
          restaurant_id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          pin_hash?: string | null
          restaurant_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_has_role: { Args: { roles: string[] }; Returns: boolean }
      auth_is_staff: { Args: never; Returns: boolean }
      auth_restaurant_id: { Args: never; Returns: string }
      auth_user_role: { Args: never; Returns: string }
      custom_jwt_claims: { Args: { event: Json }; Returns: Json }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

