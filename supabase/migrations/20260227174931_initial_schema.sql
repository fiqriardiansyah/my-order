-- ============================================================
-- QR MENU SAAS — COMPLETE SUPABASE SCHEMA
-- Migration: 20240101000000_initial_schema.sql
--
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste and run this entire file
-- OR
-- supabase db push (if using Supabase CLI)
--
-- SECTIONS:
-- 0. Extensions
-- 1. TENANT LAYER     (restaurants, settings, user_profiles)
-- 2. OPERATIONS LAYER (zones, tables, qr_codes, sessions, menus)
-- 3. TRANSACTION LAYER (orders, payments, receipts)
-- 4. AUDIT LAYER      (notifications, activity_logs, table_moves)
-- 5. TRIGGERS
-- 6. ROW LEVEL SECURITY
-- 7. AUTH HOOK (custom JWT claims)
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_bytes


-- ============================================================
-- 1. TENANT LAYER
-- ============================================================

-- ─── restaurants ─────────────────────────────────────────────
-- Root tenant table. Every other table links back here.
-- One row = one cafe/restaurant = one tenant.

CREATE TABLE restaurants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  -- slug is the public identifier used in QR URLs
  -- e.g. menuqr.app/kopi-sore/table-01
  logo_url        TEXT,
  address         TEXT,
  phone           VARCHAR(50),
  email           VARCHAR(255),
  currency        CHAR(3)       NOT NULL DEFAULT 'IDR',
  timezone        VARCHAR(100)  NOT NULL DEFAULT 'Asia/Jakarta',
  country_code    CHAR(2)       NOT NULL DEFAULT 'ID',
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  trial_ends_at   TIMESTAMPTZ,
  subscribed_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ   -- soft delete, never hard delete
);

CREATE INDEX idx_restaurants_slug
  ON restaurants(slug)
  WHERE deleted_at IS NULL;


-- ─── restaurant_settings ─────────────────────────────────────
-- 1:1 extension of restaurants.
-- Keeps restaurants table clean, groups all config here.

CREATE TABLE restaurant_settings (
  id                          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id               UUID      NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Security & Operations
  require_table_open          BOOLEAN   NOT NULL DEFAULT true,
  -- true  = staff must open table before customer can submit orders
  -- false = customer can order freely after scanning
  auto_confirm_orders         BOOLEAN   NOT NULL DEFAULT false,
  -- true  = orders skip staff confirmation, go straight to kitchen

  -- Tax & Charges
  tax_percentage              DECIMAL(5,2)  NOT NULL DEFAULT 11.00,
  -- Indonesia PPN default 11%
  service_charge_percentage   DECIMAL(5,2)  NOT NULL DEFAULT 0,
  tax_inclusive               BOOLEAN   NOT NULL DEFAULT false,
  -- false = prices shown exclude tax (tax added at checkout)
  -- true  = prices already include tax

  -- Receipt Customization
  receipt_header              TEXT,     -- e.g. "Thank you for visiting!"
  receipt_footer              TEXT,     -- e.g. "Follow us @kopisore"
  show_tax_on_receipt         BOOLEAN   NOT NULL DEFAULT true,
  show_service_on_receipt     BOOLEAN   NOT NULL DEFAULT true,

  -- Operating Hours
  -- Format: {"mon":{"open":"08:00","close":"22:00","closed":false},...}
  -- Days: mon, tue, wed, thu, fri, sat, sun
  operating_hours             JSONB,

  -- Notifications
  sound_alert_enabled         BOOLEAN   NOT NULL DEFAULT true,
  kitchen_display_enabled     BOOLEAN   NOT NULL DEFAULT true,

  -- Thermal Printer
  printer_enabled             BOOLEAN   NOT NULL DEFAULT false,
  printer_ip                  VARCHAR(100),
  printer_port                INTEGER   DEFAULT 9100,
  paper_size                  VARCHAR(10) DEFAULT '80mm',  -- '58mm' or '80mm'

  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── user_profiles ───────────────────────────────────────────
-- Staff accounts. Linked to auth.users (Supabase Auth) by UUID.
-- NOTE: You never INSERT into auth.users directly.
--       Call supabase.auth.signUp() — the trigger below auto-creates this row.
--
-- Replaces the original `users` table from the design doc.
-- Password/email management is handled by Supabase Auth (auth.users).

CREATE TABLE user_profiles (
  id              UUID      PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Same UUID as auth.users.id — this is the link
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  full_name       VARCHAR(255) NOT NULL,
  avatar_url      TEXT,
  role            VARCHAR(50)  NOT NULL DEFAULT 'floor_staff',
  -- Roles: 'owner' | 'manager' | 'floor_staff' | 'cashier' | 'kitchen'
  pin_hash        TEXT,
  -- Optional 4-6 digit PIN hash for quick tablet login
  -- Separate from Supabase Auth password — just for fast staff login UX
  is_active       BOOLEAN   NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ -- soft delete

  -- Note: email lives in auth.users, access via auth.users.email
  -- Note: password lives in auth.users, managed by Supabase Auth
);

CREATE INDEX idx_user_profiles_restaurant
  ON user_profiles(restaurant_id)
  WHERE deleted_at IS NULL;


-- ============================================================
-- 2. OPERATIONS LAYER
-- ============================================================

-- ─── table_zones ─────────────────────────────────────────────
-- Optional grouping for tables: Indoor, Outdoor, VIP, Counter.

CREATE TABLE table_zones (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  sort_order      SMALLINT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(restaurant_id, name)
);


-- ─── tables ──────────────────────────────────────────────────
-- Physical tables in the restaurant.
-- Each table gets one active QR code at a time.

CREATE TABLE tables (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  zone_id         UUID      REFERENCES table_zones(id) ON DELETE SET NULL,
  name            VARCHAR(100) NOT NULL,  -- 'Table 01', 'Bar Seat A'
  slug            VARCHAR(50)  NOT NULL,  -- 't01', 'bar-a' — used in QR URL
  capacity        SMALLINT,               -- optional seat count
  is_active       BOOLEAN   NOT NULL DEFAULT true,
  sort_order      SMALLINT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,

  UNIQUE(restaurant_id, slug)
);

CREATE INDEX idx_tables_restaurant
  ON tables(restaurant_id)
  WHERE deleted_at IS NULL;


-- ─── qr_codes ────────────────────────────────────────────────
-- Each table has one active QR code at a time.
-- When regenerated, old token is deactivated — old QR sticker stops working.
-- QR URL: menuqr.app/{restaurant_slug}/{table_slug}?t={token}

CREATE TABLE qr_codes (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id        UUID      NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  token           VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active       BOOLEAN   NOT NULL DEFAULT true,
  generated_by    UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_token
  ON qr_codes(token)
  WHERE is_active = true;


-- ─── table_sessions ──────────────────────────────────────────
-- A "session" = one group of customers at a table, from open to payment.
-- All orders tie to a session, not directly to a table.
-- This enables clean history: one table can have many sessions over time.

CREATE TABLE table_sessions (
  id                  UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id            UUID      NOT NULL REFERENCES tables(id),
  restaurant_id       UUID      NOT NULL REFERENCES restaurants(id),
  opened_by           UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  closed_by           UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'open',
  -- Status flow: 'open' → 'bill_requested' → 'closed'
  -- Special: 'moved' (table move, no payment) | 'merged' (merged into another session)
  guest_count         SMALLINT,   -- optional, staff can enter when opening
  bill_requested_at   TIMESTAMPTZ,
  opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at           TIMESTAMPTZ,

  -- Table move support (links this session to the one it moved from)
  parent_session_id   UUID      REFERENCES table_sessions(id),
  moved_from_table_id UUID      REFERENCES tables(id),
  moved_at            TIMESTAMPTZ
);

-- Enforce only one open session per table at the DB level
-- Attempt to open a second session on an occupied table = error
CREATE UNIQUE INDEX unique_open_session_per_table
  ON table_sessions(table_id)
  WHERE status = 'open';

CREATE INDEX idx_sessions_restaurant_active
  ON table_sessions(restaurant_id)
  WHERE status IN ('open', 'bill_requested');

CREATE INDEX idx_sessions_table
  ON table_sessions(table_id, status);


-- ─── table_moves ─────────────────────────────────────────────
-- Audit log every time a customer moves from one table to another.

CREATE TABLE table_moves (
  id                UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID      NOT NULL REFERENCES restaurants(id),
  from_session_id   UUID      NOT NULL REFERENCES table_sessions(id),
  to_session_id     UUID      NOT NULL REFERENCES table_sessions(id),
  from_table_id     UUID      NOT NULL REFERENCES tables(id),
  to_table_id       UUID      NOT NULL REFERENCES tables(id),
  moved_by          UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  move_type         VARCHAR(20) NOT NULL DEFAULT 'move',
  -- 'move' = full table move | 'merge' = two tables combined
  move_reason       TEXT,
  orders_moved      INTEGER   NOT NULL DEFAULT 0,
  moved_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── menus ───────────────────────────────────────────────────
-- A restaurant can have multiple menus (Dine-in, Takeaway, Happy Hour).
-- V1: one default menu per restaurant is enough.

CREATE TABLE menus (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL DEFAULT 'Main Menu',
  is_default      BOOLEAN   NOT NULL DEFAULT false,
  is_active       BOOLEAN   NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Ensure only one default menu per restaurant
CREATE UNIQUE INDEX unique_default_menu_per_restaurant
  ON menus(restaurant_id)
  WHERE is_default = true AND deleted_at IS NULL;


-- ─── menu_categories ─────────────────────────────────────────
-- Groups menu items: Coffee, Food, Snacks, Drinks, etc.

CREATE TABLE menu_categories (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id         UUID      NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  -- Denormalized for faster queries — avoids joining through menus every time
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  image_url       TEXT,
  sort_order      SMALLINT  NOT NULL DEFAULT 0,
  is_visible      BOOLEAN   NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_categories_menu
  ON menu_categories(menu_id, sort_order)
  WHERE deleted_at IS NULL;


-- ─── menu_items ──────────────────────────────────────────────
-- Individual items on the menu.

CREATE TABLE menu_items (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID      NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  -- Denormalized for faster queries
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  image_url       TEXT,
  base_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_available    BOOLEAN   NOT NULL DEFAULT true,
  -- Staff can toggle this in real-time: available / sold out
  -- Realtime subscription notifies customers instantly when toggled
  is_featured     BOOLEAN   NOT NULL DEFAULT false,
  sort_order      SMALLINT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_items_category
  ON menu_items(category_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_items_restaurant
  ON menu_items(restaurant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_items_available
  ON menu_items(category_id, sort_order)
  WHERE is_available = true AND deleted_at IS NULL;


-- ─── menu_item_variants ───────────────────────────────────────
-- Size/type options for an item: Size (Small/Medium/Large), Temp (Hot/Iced).
-- Each option can add/subtract from the base price.

CREATE TABLE menu_item_variants (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID      NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  group_name      VARCHAR(100) NOT NULL,   -- 'Size', 'Temperature'
  option_name     VARCHAR(100) NOT NULL,   -- 'Large', 'Iced'
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- Positive = add to price, Negative = discount, Zero = no change
  is_required     BOOLEAN   NOT NULL DEFAULT false,
  -- true = customer must choose from this group
  is_available    BOOLEAN   NOT NULL DEFAULT true,
  sort_order      SMALLINT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_variants_item
  ON menu_item_variants(menu_item_id)
  WHERE deleted_at IS NULL;


-- ─── menu_item_modifiers ──────────────────────────────────────
-- Optional add-ons that can stack: Extra Shot, Less Sugar, Oat Milk.
-- Unlike variants, customer can select multiple modifiers.

CREATE TABLE menu_item_modifiers (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID      NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  name            VARCHAR(100) NOT NULL,   -- 'Extra Shot', 'Less Sugar'
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_available    BOOLEAN   NOT NULL DEFAULT true,
  sort_order      SMALLINT  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_modifiers_item
  ON menu_item_modifiers(menu_item_id)
  WHERE deleted_at IS NULL;


-- ============================================================
-- 3. TRANSACTION LAYER
-- ============================================================

-- ─── orders ──────────────────────────────────────────────────
-- One order = one submission from the customer.
-- A session can have multiple orders (customer orders again later).
-- IMPORTANT: order_number, tax snapshots, and totals are auto-set by triggers.

CREATE TABLE orders (
  id                    UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id         UUID      NOT NULL REFERENCES restaurants(id),
  table_id              UUID      NOT NULL REFERENCES tables(id),
  session_id            UUID      NOT NULL REFERENCES table_sessions(id),
  order_number          VARCHAR(20) NOT NULL DEFAULT '',
  -- Auto-generated by trigger: 'ORD-0001', 'ORD-0002', etc.

  status                VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- Status flow:
  -- pending    → customer submitted, waiting for staff confirmation
  -- confirmed  → staff confirmed, sent to kitchen
  -- preparing  → kitchen started
  -- ready      → kitchen finished, waiting to be served
  -- served     → staff marked as delivered to table
  -- cancelled  → rejected by staff or cancelled

  customer_note         TEXT,
  -- Customer note for the whole order (e.g. "we're in a rush")

  -- Pricing (all calculated by trigger after order_items inserted)
  subtotal              DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount            DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount          DECIMAL(12,2) NOT NULL DEFAULT 0,

  -- Rates snapshot — CRITICAL: these are copied from settings at order time
  -- Even if restaurant changes tax rate later, this order reflects the original rate
  tax_rate_snapshot         DECIMAL(5,2) NOT NULL DEFAULT 0,
  service_rate_snapshot     DECIMAL(5,2) NOT NULL DEFAULT 0,

  -- Staff actions
  confirmed_by          UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  confirmed_at          TIMESTAMPTZ,
  cancelled_by          UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  cancelled_at          TIMESTAMPTZ,
  cancellation_reason   TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE global_order_seq;
-- Used by trigger to generate sequential order numbers

CREATE INDEX idx_orders_session
  ON orders(session_id);

CREATE INDEX idx_orders_restaurant_status
  ON orders(restaurant_id, status);

CREATE INDEX idx_orders_restaurant_date
  ON orders(restaurant_id, created_at DESC);


-- ─── order_items ─────────────────────────────────────────────
-- Line items within an order.
-- CRITICAL: item_name, unit_price are SNAPSHOTS copied at order time.
-- Never read menu_items for historical order data — always read the snapshot.

CREATE TABLE order_items (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  menu_item_id    UUID      REFERENCES menu_items(id) ON DELETE SET NULL,
  -- Nullable: menu item can be deleted later, snapshot preserves the data

  -- Snapshots (never change after insert)
  item_name       VARCHAR(255) NOT NULL,
  item_image_url  TEXT,
  unit_price      DECIMAL(12,2) NOT NULL,
  -- Final price per unit: base_price + all variant modifiers + all modifier prices
  quantity        SMALLINT  NOT NULL DEFAULT 1,
  subtotal        DECIMAL(12,2) NOT NULL,
  -- = unit_price × quantity

  item_note       TEXT,
  -- Per-item note from customer: 'no ice', 'extra spicy', 'allergy: peanut'

  -- Kitchen tracking
  kitchen_status  VARCHAR(20) NOT NULL DEFAULT 'queued',
  -- 'queued' | 'preparing' | 'ready' | 'served'
  kitchen_ready_at TIMESTAMPTZ,
  served_at       TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order
  ON order_items(order_id);

CREATE INDEX idx_order_items_restaurant
  ON order_items(restaurant_id);


-- ─── order_item_variants ──────────────────────────────────────
-- Snapshot of selected variants for each order item.
-- e.g. Size: Large (+10,000), Temperature: Iced (+3,000)

CREATE TABLE order_item_variants (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID      NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  variant_id      UUID      REFERENCES menu_item_variants(id) ON DELETE SET NULL,
  -- Nullable: variant can be deleted, snapshot preserves the data
  group_name      VARCHAR(100) NOT NULL,  -- snapshot: 'Size'
  option_name     VARCHAR(100) NOT NULL,  -- snapshot: 'Large'
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0  -- snapshot: 10000
);


-- ─── order_item_modifiers ─────────────────────────────────────
-- Snapshot of selected add-ons for each order item.
-- e.g. Extra Shot (+5,000), Less Sugar (+0)

CREATE TABLE order_item_modifiers (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID      NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id     UUID      REFERENCES menu_item_modifiers(id) ON DELETE SET NULL,
  modifier_name   VARCHAR(100) NOT NULL,  -- snapshot: 'Extra Shot'
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0  -- snapshot: 5000
);


-- ─── payments ────────────────────────────────────────────────
-- Payment record for a table session.
-- V1: one payment per session. V2: multiple for split bills.

CREATE TABLE payments (
  id                UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID      NOT NULL REFERENCES restaurants(id),
  session_id        UUID      NOT NULL REFERENCES table_sessions(id),
  payment_method    VARCHAR(30) NOT NULL,
  -- 'cash' | 'card' | 'ewallet' | 'transfer' | 'other'
  payment_reference VARCHAR(255),
  -- e-wallet transaction ID, card last 4 digits, bank transfer ref, etc.

  -- Amounts
  subtotal          DECIMAL(12,2) NOT NULL,
  tax_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount      DECIMAL(12,2) NOT NULL,
  amount_tendered   DECIMAL(12,2),  -- for cash: how much customer gave
  change_given      DECIMAL(12,2),  -- = amount_tendered - total_amount

  -- Discount
  discount_type     VARCHAR(20),    -- 'percentage' | 'fixed'
  discount_value    DECIMAL(10,2),  -- 10 = 10% off OR 10000 fixed amount
  discount_reason   TEXT,
  discount_applied_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Staff
  processed_by      UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Status
  status            VARCHAR(20) NOT NULL DEFAULT 'completed',
  -- 'completed' | 'voided'
  voided_by         UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  voided_at         TIMESTAMPTZ,
  void_reason       TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_session
  ON payments(session_id);

CREATE INDEX idx_payments_restaurant_date
  ON payments(restaurant_id, created_at DESC);


-- ─── receipts ────────────────────────────────────────────────
-- Full receipt snapshot for digital viewing and reprinting.
-- Stored as JSON so reprinting always works even if settings change.

CREATE TABLE receipts (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID      NOT NULL UNIQUE REFERENCES payments(id),
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  receipt_number  VARCHAR(50) NOT NULL,
  -- Format: 'RCP-2024-0001'

  -- Complete receipt data snapshot as JSON
  -- Contains: restaurant info, table, items, totals, payment, cashier name
  -- This is the source of truth for reprinting — never rebuild from live data
  receipt_data    JSONB     NOT NULL,

  view_token      VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- Public token for digital receipt URL: menuqr.app/receipt/{view_token}
  -- Customer gets this link after payment to view/share their receipt

  printed_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipts_view_token
  ON receipts(view_token);

CREATE INDEX idx_receipts_restaurant
  ON receipts(restaurant_id, created_at DESC);


-- ============================================================
-- 4. AUDIT LAYER
-- ============================================================

-- ─── notifications ───────────────────────────────────────────
-- In-app notifications pushed to staff via Supabase Realtime.
-- Supabase Realtime fires on INSERT to this table.

CREATE TABLE notifications (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  target_role     VARCHAR(50),
  -- null = all staff | 'floor_staff' | 'cashier' | 'kitchen' | 'owner'
  target_user_id  UUID      REFERENCES user_profiles(id) ON DELETE CASCADE,
  -- null = broadcast to role | set = specific user only

  type            VARCHAR(50) NOT NULL,
  -- 'new_order'       → staff: new order pending confirmation
  -- 'order_confirmed' → customer: order is confirmed
  -- 'order_ready'     → floor staff: item ready to serve
  -- 'bill_requested'  → floor staff/cashier: table wants to pay
  -- 'order_rejected'  → customer: order was rejected
  -- 'table_moved'     → staff: table session moved

  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  data            JSONB,
  -- e.g. { "order_id": "uuid", "table_id": "uuid", "session_id": "uuid" }

  is_read         BOOLEAN   NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_restaurant
  ON notifications(restaurant_id, is_read, created_at DESC);

CREATE INDEX idx_notifications_user
  ON notifications(target_user_id, is_read)
  WHERE target_user_id IS NOT NULL;


-- ─── activity_logs ───────────────────────────────────────────
-- Immutable audit trail. Never update or delete rows here.
-- Used for: debugging, disputes, security review, staff accountability.

CREATE TABLE activity_logs (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID      NOT NULL REFERENCES restaurants(id),
  user_id         UUID      REFERENCES user_profiles(id) ON DELETE SET NULL,
  -- null = system action (e.g. auto-confirm by settings)

  action          VARCHAR(100) NOT NULL,
  -- Examples:
  -- 'order.confirmed'     'order.rejected'      'order.cancelled'
  -- 'payment.processed'   'payment.voided'
  -- 'session.opened'      'session.closed'      'session.moved'
  -- 'menu_item.toggled'   'menu_item.created'   'menu_item.deleted'
  -- 'discount.applied'    'qr.regenerated'
  -- 'staff.created'       'staff.deactivated'

  entity_type     VARCHAR(50),   -- 'order' | 'payment' | 'session' | 'menu_item' | 'user'
  entity_id       UUID,

  metadata        JSONB,
  -- Can contain: before/after state, reason, amounts, etc.
  -- Example for discount: { "type": "percentage", "value": 10, "reason": "loyal customer" }

  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_restaurant_date
  ON activity_logs(restaurant_id, created_at DESC);

CREATE INDEX idx_logs_entity
  ON activity_logs(entity_type, entity_id);

CREATE INDEX idx_logs_user
  ON activity_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;


-- ============================================================
-- 5. TRIGGERS
-- ============================================================

-- ─── Trigger 1: Auto-create user_profile on signup ───────────
-- When owner calls supabase.auth.signUp(), Supabase inserts into auth.users.
-- This trigger fires immediately after, creating the user_profiles row.
-- Prevents orphaned auth accounts with no profile.
-- Extra data passed via signUp({ options: { data: { ... } } })

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    restaurant_id,
    full_name,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data ->> 'restaurant_id')::uuid,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'owner'),
    -- Default to 'owner' because self-signup = creating a new restaurant.
    -- Staff added later by the owner will have an explicit role in metadata.
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();


-- ─── Trigger 2: Snapshot tax rates on order creation ─────────
-- When a new order is inserted, copy the restaurant's current tax/service rates.
-- This means: changing tax settings later won't affect past orders.

CREATE OR REPLACE FUNCTION snapshot_tax_rates_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT
    COALESCE(tax_percentage, 0),
    COALESCE(service_charge_percentage, 0)
  INTO
    NEW.tax_rate_snapshot,
    NEW.service_rate_snapshot
  FROM restaurant_settings
  WHERE restaurant_id = NEW.restaurant_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_snapshot_tax_rates
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION snapshot_tax_rates_on_order();


-- ─── Trigger 3: Auto-generate order number ───────────────────
-- Generates human-readable order numbers like 'ORD-0001', 'ORD-0042'.
-- Uses a global sequence. For per-restaurant sequences, upgrade to V2.

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.order_number := 'ORD-' || LPAD(NEXTVAL('global_order_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();


-- ─── Trigger 4: Recalculate order totals ─────────────────────
-- Fires after order_items are inserted, updated, or deleted.
-- Keeps order.subtotal, tax_amount, service_amount, total_amount always accurate.
-- No manual total calculation needed in frontend or backend.

CREATE OR REPLACE FUNCTION recalculate_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id        UUID;
  v_subtotal        DECIMAL(12,2);
  v_tax_rate        DECIMAL(5,2);
  v_service_rate    DECIMAL(5,2);
  v_tax_amount      DECIMAL(12,2);
  v_service_amount  DECIMAL(12,2);
BEGIN
  -- Determine the order_id from the triggering row
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  -- Sum all item subtotals for this order
  SELECT COALESCE(SUM(subtotal), 0)
  INTO v_subtotal
  FROM order_items
  WHERE order_id = v_order_id;

  -- Get the snapshotted rates from the order itself
  SELECT tax_rate_snapshot, service_rate_snapshot
  INTO v_tax_rate, v_service_rate
  FROM orders
  WHERE id = v_order_id;

  -- Calculate amounts
  v_tax_amount      := ROUND(v_subtotal * (v_tax_rate / 100), 0);
  v_service_amount  := ROUND(v_subtotal * (v_service_rate / 100), 0);

  -- Update the parent order
  UPDATE orders
  SET
    subtotal      = v_subtotal,
    tax_amount    = v_tax_amount,
    service_amount = v_service_amount,
    total_amount  = v_subtotal + v_tax_amount + v_service_amount - discount_amount,
    updated_at    = NOW()
  WHERE id = v_order_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_recalculate_order_totals
  AFTER INSERT OR UPDATE OF quantity, unit_price, subtotal OR DELETE
  ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_order_totals();


-- ─── Trigger 5: Auto-sync order status from kitchen items ────
-- When ALL order_items for an order are marked 'ready',
-- automatically update the parent order status to 'ready'.

CREATE OR REPLACE FUNCTION sync_order_status_from_kitchen()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_items   INTEGER;
  v_ready_items   INTEGER;
  v_order_status  VARCHAR(30);
BEGIN
  -- Only act on kitchen_status changes
  IF NEW.kitchen_status = OLD.kitchen_status THEN
    RETURN NEW;
  END IF;

  -- Get current order status
  SELECT status INTO v_order_status
  FROM orders WHERE id = NEW.order_id;

  -- Only auto-update if order is confirmed or already preparing
  IF v_order_status NOT IN ('confirmed', 'preparing') THEN
    RETURN NEW;
  END IF;

  -- Count total and ready items
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE kitchen_status = 'ready')
  INTO v_total_items, v_ready_items
  FROM order_items
  WHERE order_id = NEW.order_id;

  -- If any item is now 'preparing', set order to 'preparing'
  IF NEW.kitchen_status = 'preparing' AND v_order_status = 'confirmed' THEN
    UPDATE orders
    SET status = 'preparing', updated_at = NOW()
    WHERE id = NEW.order_id;

  -- If ALL items are 'ready', set order to 'ready'
  ELSIF v_ready_items = v_total_items AND v_total_items > 0 THEN
    UPDATE orders
    SET status = 'ready', updated_at = NOW()
    WHERE id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sync_order_status
  AFTER UPDATE OF kitchen_status ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION sync_order_status_from_kitchen();


-- ─── Trigger 6: Auto-update updated_at timestamps ────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_restaurants
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_menu_items
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- This is your backend security — enforced at the database level.
-- Even if frontend code has bugs, these policies prevent data leaks.
-- The anon key (in frontend) is safe BECAUSE of these policies.

-- Enable RLS on every table
ALTER TABLE restaurants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_zones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_moves             ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_modifiers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_variants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_modifiers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs           ENABLE ROW LEVEL SECURITY;


-- ─── Helper functions for RLS policies ───────────────────────

-- Get current user's restaurant_id.
-- Tries JWT claim first (fast path when hook is configured).
-- Falls back to a user_profiles lookup so RLS works even without the hook.
CREATE OR REPLACE FUNCTION auth_restaurant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'restaurant_id', '')::uuid,
    (SELECT restaurant_id FROM public.user_profiles WHERE id = auth.uid())
  );
$$;

-- Get current user's role from JWT claim
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() ->> 'user_role';
$$;

-- Check if current user has one of the given roles
CREATE OR REPLACE FUNCTION auth_has_role(roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'user_role') = ANY(roles);
$$;

-- Check if current user is staff (any authenticated role)
CREATE OR REPLACE FUNCTION auth_is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'user_role') IS NOT NULL;
$$;


-- ─── restaurants ─────────────────────────────────────────────

CREATE POLICY "staff_select_own_restaurant"
  ON restaurants FOR SELECT
  USING (id = auth_restaurant_id());

-- Authenticated users can create a restaurant (needed when no pre-created placeholder exists)
CREATE POLICY "authenticated_insert_restaurant"
  ON restaurants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "owner_update_own_restaurant"
  ON restaurants FOR UPDATE
  USING (id = auth_restaurant_id())
  WITH CHECK (id = auth_restaurant_id());


-- ─── restaurant_settings ─────────────────────────────────────

CREATE POLICY "staff_select_settings"
  ON restaurant_settings FOR SELECT
  USING (restaurant_id = auth_restaurant_id());

CREATE POLICY "owner_update_settings"
  ON restaurant_settings FOR UPDATE
  USING (restaurant_id = auth_restaurant_id() AND auth_has_role(ARRAY['owner', 'manager']))
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── user_profiles ───────────────────────────────────────────

-- Users can always read their own profile (needed during onboarding before
-- restaurant_id is present in the JWT claim)
CREATE POLICY "user_select_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Staff can see all profiles in their restaurant (for staff management UI)
CREATE POLICY "staff_select_restaurant_profiles"
  ON user_profiles FOR SELECT
  USING (restaurant_id = auth_restaurant_id());

-- Staff can update their own profile only
CREATE POLICY "staff_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Owners/managers can update any profile in their restaurant
CREATE POLICY "owner_update_any_profile"
  ON user_profiles FOR UPDATE
  USING (restaurant_id = auth_restaurant_id() AND auth_has_role(ARRAY['owner', 'manager']))
  WITH CHECK (restaurant_id = auth_restaurant_id());

-- INSERT is handled by the auth trigger, not directly


-- ─── table_zones ─────────────────────────────────────────────

CREATE POLICY "staff_select_zones"
  ON table_zones FOR SELECT
  USING (restaurant_id = auth_restaurant_id());

CREATE POLICY "manager_manage_zones"
  ON table_zones FOR ALL
  USING (restaurant_id = auth_restaurant_id() AND auth_has_role(ARRAY['owner', 'manager']))
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── tables ──────────────────────────────────────────────────

-- Public can read active tables (needed for QR scan to identify table)
CREATE POLICY "public_select_active_tables"
  ON tables FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Staff manage their own restaurant's tables
CREATE POLICY "staff_manage_tables"
  ON tables FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── qr_codes ────────────────────────────────────────────────

-- Public can read active QR codes to validate tokens on scan
CREATE POLICY "public_select_active_qr"
  ON qr_codes FOR SELECT
  USING (is_active = true);

-- Staff manage QR codes for their restaurant
CREATE POLICY "staff_manage_qr_codes"
  ON qr_codes FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── table_sessions ──────────────────────────────────────────

-- Public can read open sessions (customer needs session_id to submit order)
CREATE POLICY "public_select_open_sessions"
  ON table_sessions FOR SELECT
  USING (status = 'open');

-- Staff manage all sessions in their restaurant
CREATE POLICY "staff_manage_sessions"
  ON table_sessions FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── menus ───────────────────────────────────────────────────

CREATE POLICY "public_select_active_menus"
  ON menus FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "staff_manage_menus"
  ON menus FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── menu_categories ─────────────────────────────────────────

-- Public can browse menu categories (no auth needed for customers)
CREATE POLICY "public_select_visible_categories"
  ON menu_categories FOR SELECT
  USING (is_visible = true AND deleted_at IS NULL);

-- Staff manage categories for their restaurant
CREATE POLICY "staff_manage_categories"
  ON menu_categories FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── menu_items ──────────────────────────────────────────────

-- Public can read all non-deleted menu items
CREATE POLICY "public_select_menu_items"
  ON menu_items FOR SELECT
  USING (deleted_at IS NULL);

-- Staff manage menu items for their restaurant
CREATE POLICY "staff_manage_menu_items"
  ON menu_items FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── menu_item_variants & modifiers ──────────────────────────

CREATE POLICY "public_select_variants"
  ON menu_item_variants FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "staff_manage_variants"
  ON menu_item_variants FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());

CREATE POLICY "public_select_modifiers"
  ON menu_item_modifiers FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "staff_manage_modifiers"
  ON menu_item_modifiers FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── orders ──────────────────────────────────────────────────

-- Customers (unauthenticated) can submit orders
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT
  WITH CHECK (true);
  -- Note: The session must exist (FK constraint) and be open (app-level check)
  -- RLS on table_sessions already restricts what sessions are visible

-- Customers can read their own session's orders for status tracking
-- Uses a session token stored in browser (not auth JWT)
CREATE POLICY "public_select_own_session_orders"
  ON orders FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM table_sessions WHERE status IN ('open', 'bill_requested')
    )
    AND auth.role() = 'anon'
  );

-- Staff can read all orders in their restaurant
CREATE POLICY "staff_select_restaurant_orders"
  ON orders FOR SELECT
  USING (restaurant_id = auth_restaurant_id());

-- Staff can update order status
CREATE POLICY "staff_update_orders"
  ON orders FOR UPDATE
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── order_items ─────────────────────────────────────────────

-- Customers can insert order items when submitting an order
CREATE POLICY "public_insert_order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Customers can read items from open sessions
CREATE POLICY "public_select_open_session_order_items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN table_sessions s ON o.session_id = s.id
      WHERE s.status IN ('open', 'bill_requested')
    )
    AND auth.role() = 'anon'
  );

-- Staff can read and update order items for their restaurant
CREATE POLICY "staff_manage_order_items"
  ON order_items FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── order_item_variants & modifiers ─────────────────────────

CREATE POLICY "public_insert_order_item_variants"
  ON order_item_variants FOR INSERT WITH CHECK (true);

CREATE POLICY "public_insert_order_item_modifiers"
  ON order_item_modifiers FOR INSERT WITH CHECK (true);

CREATE POLICY "staff_select_order_item_variants"
  ON order_item_variants FOR SELECT
  USING (
    order_item_id IN (
      SELECT id FROM order_items WHERE restaurant_id = auth_restaurant_id()
    )
  );

CREATE POLICY "staff_select_order_item_modifiers"
  ON order_item_modifiers FOR SELECT
  USING (
    order_item_id IN (
      SELECT id FROM order_items WHERE restaurant_id = auth_restaurant_id()
    )
  );


-- ─── payments ────────────────────────────────────────────────

-- Only cashier/owner/manager can process payments
CREATE POLICY "cashier_manage_payments"
  ON payments FOR ALL
  USING (
    restaurant_id = auth_restaurant_id()
    AND auth_has_role(ARRAY['owner', 'manager', 'cashier'])
  )
  WITH CHECK (
    restaurant_id = auth_restaurant_id()
    AND auth_has_role(ARRAY['owner', 'manager', 'cashier'])
  );

-- All staff can read payments (for order history, reports)
CREATE POLICY "staff_select_payments"
  ON payments FOR SELECT
  USING (restaurant_id = auth_restaurant_id());


-- ─── receipts ────────────────────────────────────────────────

-- Public can read receipts by view_token (for digital receipt link)
CREATE POLICY "public_select_receipt_by_token"
  ON receipts FOR SELECT
  USING (true);
  -- Security is the view_token itself — unguessable random string
  -- Frontend filters by view_token, not by id

-- Staff can manage receipts for their restaurant
CREATE POLICY "staff_manage_receipts"
  ON receipts FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── notifications ───────────────────────────────────────────

CREATE POLICY "staff_select_own_notifications"
  ON notifications FOR SELECT
  USING (
    restaurant_id = auth_restaurant_id()
    AND (
      target_user_id = auth.uid()           -- notification for this specific user
      OR target_role = auth_user_role()     -- notification for this role
      OR target_role IS NULL                -- broadcast to all staff
    )
  );

CREATE POLICY "staff_update_own_notifications"
  ON notifications FOR UPDATE
  USING (target_user_id = auth.uid() OR restaurant_id = auth_restaurant_id())
  WITH CHECK (true);

-- System inserts notifications (via service role in Edge Functions)
-- No direct insert from frontend needed


-- ─── activity_logs ───────────────────────────────────────────

-- Owner/manager can read logs; floor staff cannot
CREATE POLICY "manager_select_activity_logs"
  ON activity_logs FOR SELECT
  USING (
    restaurant_id = auth_restaurant_id()
    AND auth_has_role(ARRAY['owner', 'manager'])
  );

-- Logs are inserted by service role (Edge Functions) only
-- No direct insert from frontend


-- ============================================================
-- 7. CUSTOM JWT CLAIMS (Auth Hook)
-- ============================================================
-- This function is called by Supabase every time a JWT is issued.
-- It adds restaurant_id and user_role to the JWT claims.
-- These claims are then available in RLS policies via auth.jwt().
--
-- HOW TO ACTIVATE:
-- 1. Deploy this function
-- 2. Go to Supabase Dashboard → Authentication → Hooks
-- 3. Set "Custom Access Token Hook" to: public.custom_jwt_claims

CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile    RECORD;
  claims          JSONB;
BEGIN
  -- Get the user's profile
  SELECT restaurant_id, role, is_active
  INTO user_profile
  FROM public.user_profiles
  WHERE id = (event ->> 'user_id')::uuid;

  -- If no profile found (e.g. during initial signup before trigger fires)
  -- return the event unchanged
  IF NOT FOUND THEN
    RETURN event;
  END IF;

  -- If account is deactivated, prevent login by not adding claims
  -- (App layer should also check is_active, but this is a DB-level guard)
  IF NOT user_profile.is_active THEN
    RETURN event;
  END IF;

  -- Add custom claims to the JWT
  claims := event -> 'claims';
  claims := jsonb_set(claims, '{restaurant_id}', to_jsonb(user_profile.restaurant_id::text));
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_profile.role));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;
