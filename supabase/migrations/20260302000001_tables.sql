-- ============================================================
-- TABLES
-- Migration: 20260302_01_tables.sql
--
-- Contains: extensions, all CREATE TABLE, indexes, sequences.
-- Nothing else — no functions, no triggers, no policies.
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- TENANT LAYER
-- ============================================================

-- ─── restaurants ─────────────────────────────────────────────
-- Root tenant table. Every other table links back here.
-- One row = one cafe/restaurant = one tenant.

CREATE TABLE restaurants (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255)  NOT NULL,
  slug            VARCHAR(100)  NOT NULL UNIQUE,
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
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_restaurants_slug
  ON restaurants(slug)
  WHERE deleted_at IS NULL;


-- ─── restaurant_settings ─────────────────────────────────────
-- 1:1 extension of restaurants.
-- Keeps the restaurants table clean; groups all config here.

CREATE TABLE restaurant_settings (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id               UUID        NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Security & Operations
  require_table_open          BOOLEAN     NOT NULL DEFAULT true,
  -- true  = staff must open table before customer can submit orders
  -- false = customer can order freely after scanning
  auto_confirm_orders         BOOLEAN     NOT NULL DEFAULT false,
  -- true  = orders skip staff confirmation, go straight to kitchen

  -- Tax & Charges
  tax_percentage              DECIMAL(5,2)  NOT NULL DEFAULT 11.00,
  service_charge_percentage   DECIMAL(5,2)  NOT NULL DEFAULT 0,
  tax_inclusive               BOOLEAN     NOT NULL DEFAULT false,
  -- false = prices shown exclude tax (tax added at checkout)
  -- true  = prices already include tax

  -- Receipt Customization
  receipt_header              TEXT,
  receipt_footer              TEXT,
  show_tax_on_receipt         BOOLEAN     NOT NULL DEFAULT true,
  show_service_on_receipt     BOOLEAN     NOT NULL DEFAULT true,

  -- Operating Hours
  -- Format: {"mon":{"open":"08:00","close":"22:00","closed":false},...}
  operating_hours             JSONB,

  -- Notifications
  sound_alert_enabled         BOOLEAN     NOT NULL DEFAULT true,
  kitchen_display_enabled     BOOLEAN     NOT NULL DEFAULT true,

  -- Thermal Printer
  printer_enabled             BOOLEAN     NOT NULL DEFAULT false,
  printer_ip                  VARCHAR(100),
  printer_port                INTEGER     DEFAULT 9100,
  paper_size                  VARCHAR(10) DEFAULT '80mm',  -- '58mm' or '80mm'

  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── user_profiles ───────────────────────────────────────────
-- Staff accounts linked to auth.users (Supabase Auth) by UUID.
-- NOTE: never INSERT into auth.users directly.
--       Call supabase.auth.signUp() — the trigger in 02_functions.sql
--       auto-creates both the placeholder restaurant and this row.
--
-- restaurant_id is nullable: the trigger sets it immediately,
-- but NULL is allowed so signup never hard-fails on a race condition.

CREATE TABLE user_profiles (
  id              UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id   UUID          REFERENCES restaurants(id),
  full_name       VARCHAR(255)  NOT NULL,
  avatar_url      TEXT,
  role            VARCHAR(50)   NOT NULL DEFAULT 'floor_staff',
  -- Roles: 'owner' | 'manager' | 'floor_staff' | 'cashier' | 'kitchen'
  pin_hash        TEXT,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_user_profiles_restaurant
  ON user_profiles(restaurant_id)
  WHERE deleted_at IS NULL;


-- ============================================================
-- OPERATIONS LAYER
-- ============================================================

-- ─── table_zones ─────────────────────────────────────────────
-- Optional grouping for tables: Indoor, Outdoor, VIP, Counter.

CREATE TABLE table_zones (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(100)  NOT NULL,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE(restaurant_id, name)
);


-- ─── tables ──────────────────────────────────────────────────
-- Physical tables in the restaurant.
-- Each table gets one active QR code at a time.

CREATE TABLE tables (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  zone_id         UUID          REFERENCES table_zones(id) ON DELETE SET NULL,
  name            VARCHAR(100)  NOT NULL,
  slug            VARCHAR(50)   NOT NULL,  -- 't01', 'bar-a' — used in QR URL
  capacity        SMALLINT,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
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
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id        UUID          NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  token           VARCHAR(64)   NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  generated_by    UUID          REFERENCES user_profiles(id) ON DELETE SET NULL,
  generated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_token
  ON qr_codes(token)
  WHERE is_active = true;


-- ─── table_sessions ──────────────────────────────────────────
-- A "session" = one group of customers at a table, from open to payment.
-- All orders tie to a session, not directly to a table.

CREATE TABLE table_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id            UUID        NOT NULL REFERENCES tables(id),
  restaurant_id       UUID        NOT NULL REFERENCES restaurants(id),
  opened_by           UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  closed_by           UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'open',
  -- Status flow: 'open' → 'bill_requested' → 'closed'
  -- Special: 'moved' | 'merged'
  guest_count         SMALLINT,
  bill_requested_at   TIMESTAMPTZ,
  opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at           TIMESTAMPTZ,

  parent_session_id   UUID        REFERENCES table_sessions(id),
  moved_from_table_id UUID        REFERENCES tables(id),
  moved_at            TIMESTAMPTZ
);

-- Enforce only one open session per table at the DB level
CREATE UNIQUE INDEX unique_open_session_per_table
  ON table_sessions(table_id)
  WHERE status = 'open';

CREATE INDEX idx_sessions_restaurant_active
  ON table_sessions(restaurant_id)
  WHERE status IN ('open', 'bill_requested');

CREATE INDEX idx_sessions_table
  ON table_sessions(table_id, status);


-- ─── table_moves ─────────────────────────────────────────────
-- Audit log for every table move / merge.

CREATE TABLE table_moves (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id),
  from_session_id   UUID        NOT NULL REFERENCES table_sessions(id),
  to_session_id     UUID        NOT NULL REFERENCES table_sessions(id),
  from_table_id     UUID        NOT NULL REFERENCES tables(id),
  to_table_id       UUID        NOT NULL REFERENCES tables(id),
  moved_by          UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  move_type         VARCHAR(20) NOT NULL DEFAULT 'move',  -- 'move' | 'merge'
  move_reason       TEXT,
  orders_moved      INTEGER     NOT NULL DEFAULT 0,
  moved_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── menus ───────────────────────────────────────────────────

CREATE TABLE menus (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(255)  NOT NULL DEFAULT 'Main Menu',
  is_default      BOOLEAN       NOT NULL DEFAULT false,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX unique_default_menu_per_restaurant
  ON menus(restaurant_id)
  WHERE is_default = true AND deleted_at IS NULL;


-- ─── menu_categories ─────────────────────────────────────────

CREATE TABLE menu_categories (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id         UUID          NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  name            VARCHAR(255)  NOT NULL,
  description     TEXT,
  image_url       TEXT,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  is_visible      BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_categories_menu
  ON menu_categories(menu_id, sort_order)
  WHERE deleted_at IS NULL;


-- ─── menu_items ──────────────────────────────────────────────

CREATE TABLE menu_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID          NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  name            VARCHAR(255)  NOT NULL,
  description     TEXT,
  image_url       TEXT,
  base_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_available    BOOLEAN       NOT NULL DEFAULT true,
  is_featured     BOOLEAN       NOT NULL DEFAULT false,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
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
-- Size/type options: Size (S/M/L), Temperature (Hot/Iced).

CREATE TABLE menu_item_variants (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID          NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  group_name      VARCHAR(100)  NOT NULL,
  option_name     VARCHAR(100)  NOT NULL,
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_required     BOOLEAN       NOT NULL DEFAULT false,
  is_available    BOOLEAN       NOT NULL DEFAULT true,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_variants_item
  ON menu_item_variants(menu_item_id)
  WHERE deleted_at IS NULL;


-- ─── menu_item_modifiers ──────────────────────────────────────
-- Optional stackable add-ons: Extra Shot, Less Sugar, Oat Milk.

CREATE TABLE menu_item_modifiers (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id    UUID          NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  name            VARCHAR(100)  NOT NULL,
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_available    BOOLEAN       NOT NULL DEFAULT true,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_modifiers_item
  ON menu_item_modifiers(menu_item_id)
  WHERE deleted_at IS NULL;


-- ============================================================
-- TRANSACTION LAYER
-- ============================================================

-- ─── orders ──────────────────────────────────────────────────
-- One order = one customer submission in a session.
-- order_number, tax snapshots, and totals are set by triggers.

CREATE TABLE orders (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id         UUID        NOT NULL REFERENCES restaurants(id),
  table_id              UUID        NOT NULL REFERENCES tables(id),
  session_id            UUID        NOT NULL REFERENCES table_sessions(id),
  order_number          VARCHAR(20) NOT NULL DEFAULT '',
  -- Auto-generated by trigger: 'ORD-0001', 'ORD-0042', etc.

  status                VARCHAR(30) NOT NULL DEFAULT 'pending',
  -- Flow: pending → confirmed → preparing → ready → served | cancelled

  customer_note         TEXT,

  -- Totals (calculated by trigger after order_items are inserted)
  subtotal              DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount            DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount          DECIMAL(12,2) NOT NULL DEFAULT 0,

  -- Rate snapshots — copied from settings at order time, never change
  tax_rate_snapshot     DECIMAL(5,2)  NOT NULL DEFAULT 0,
  service_rate_snapshot DECIMAL(5,2)  NOT NULL DEFAULT 0,

  confirmed_by          UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  confirmed_at          TIMESTAMPTZ,
  cancelled_by          UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  cancelled_at          TIMESTAMPTZ,
  cancellation_reason   TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE global_order_seq;

CREATE INDEX idx_orders_session
  ON orders(session_id);

CREATE INDEX idx_orders_restaurant_status
  ON orders(restaurant_id, status);

CREATE INDEX idx_orders_restaurant_date
  ON orders(restaurant_id, created_at DESC);


-- ─── order_items ─────────────────────────────────────────────
-- Line items within an order.
-- item_name and unit_price are snapshots — never read menu_items
-- for historical order data.

CREATE TABLE order_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  menu_item_id    UUID          REFERENCES menu_items(id) ON DELETE SET NULL,

  -- Snapshots (never change after insert)
  item_name       VARCHAR(255)  NOT NULL,
  item_image_url  TEXT,
  unit_price      DECIMAL(12,2) NOT NULL,
  quantity        SMALLINT      NOT NULL DEFAULT 1,
  subtotal        DECIMAL(12,2) NOT NULL,  -- = unit_price × quantity

  item_note       TEXT,

  -- Kitchen tracking
  kitchen_status  VARCHAR(20)   NOT NULL DEFAULT 'queued',
  -- 'queued' | 'preparing' | 'ready' | 'served'
  kitchen_ready_at TIMESTAMPTZ,
  served_at       TIMESTAMPTZ,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order
  ON order_items(order_id);

CREATE INDEX idx_order_items_restaurant
  ON order_items(restaurant_id);


-- ─── order_item_variants ──────────────────────────────────────
-- Snapshot of selected variants per order item.

CREATE TABLE order_item_variants (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID          NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  variant_id      UUID          REFERENCES menu_item_variants(id) ON DELETE SET NULL,
  group_name      VARCHAR(100)  NOT NULL,
  option_name     VARCHAR(100)  NOT NULL,
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0
);


-- ─── order_item_modifiers ─────────────────────────────────────
-- Snapshot of selected add-ons per order item.

CREATE TABLE order_item_modifiers (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID          NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id     UUID          REFERENCES menu_item_modifiers(id) ON DELETE SET NULL,
  modifier_name   VARCHAR(100)  NOT NULL,
  price_modifier  DECIMAL(12,2) NOT NULL DEFAULT 0
);


-- ─── payments ────────────────────────────────────────────────

CREATE TABLE payments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id),
  session_id        UUID        NOT NULL REFERENCES table_sessions(id),
  payment_method    VARCHAR(30) NOT NULL,
  -- 'cash' | 'card' | 'ewallet' | 'transfer' | 'other'
  payment_reference VARCHAR(255),

  subtotal          DECIMAL(12,2) NOT NULL,
  tax_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount      DECIMAL(12,2) NOT NULL,
  amount_tendered   DECIMAL(12,2),
  change_given      DECIMAL(12,2),

  discount_type       VARCHAR(20),   -- 'percentage' | 'fixed'
  discount_value      DECIMAL(10,2),
  discount_reason     TEXT,
  discount_applied_by UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,

  processed_by      UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,

  status            VARCHAR(20) NOT NULL DEFAULT 'completed',
  -- 'completed' | 'voided'
  voided_by         UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
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
-- receipt_data is JSON so reprinting always works even if settings change.

CREATE TABLE receipts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID        NOT NULL UNIQUE REFERENCES payments(id),
  restaurant_id   UUID        NOT NULL REFERENCES restaurants(id),
  receipt_number  VARCHAR(50) NOT NULL,

  receipt_data    JSONB       NOT NULL,
  -- Source of truth for reprinting — never rebuild from live data

  view_token      VARCHAR(64) NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- Public token for digital receipt URL

  printed_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipts_view_token
  ON receipts(view_token);

CREATE INDEX idx_receipts_restaurant
  ON receipts(restaurant_id, created_at DESC);


-- ============================================================
-- AUDIT LAYER
-- ============================================================

-- ─── notifications ───────────────────────────────────────────
-- In-app notifications pushed to staff via Supabase Realtime.

CREATE TABLE notifications (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  target_role     VARCHAR(50),
  -- null = all staff | 'floor_staff' | 'cashier' | 'kitchen' | 'owner'
  target_user_id  UUID          REFERENCES user_profiles(id) ON DELETE CASCADE,
  -- null = broadcast to role | set = specific user only

  type            VARCHAR(50)   NOT NULL,
  title           VARCHAR(255)  NOT NULL,
  body            TEXT,
  data            JSONB,

  is_read         BOOLEAN       NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_restaurant
  ON notifications(restaurant_id, is_read, created_at DESC);

CREATE INDEX idx_notifications_user
  ON notifications(target_user_id, is_read)
  WHERE target_user_id IS NOT NULL;


-- ─── activity_logs ───────────────────────────────────────────
-- Immutable audit trail. Never UPDATE or DELETE rows here.

CREATE TABLE activity_logs (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  user_id         UUID          REFERENCES user_profiles(id) ON DELETE SET NULL,
  -- null = system action (e.g. auto-confirm by settings)

  action          VARCHAR(100)  NOT NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  metadata        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_restaurant_date
  ON activity_logs(restaurant_id, created_at DESC);

CREATE INDEX idx_logs_entity
  ON activity_logs(entity_type, entity_id);

CREATE INDEX idx_logs_user
  ON activity_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
