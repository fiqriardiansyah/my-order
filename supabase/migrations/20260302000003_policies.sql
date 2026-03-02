-- ============================================================
-- ROW LEVEL SECURITY — Policies & Helpers
-- Migration: 20260302_03_policies.sql
--
-- Single source of truth for all RLS policies.
-- When modifying access control, edit THIS file only.
--
-- Contains: helper functions, ENABLE RLS, all CREATE POLICY.
-- Nothing else — no DDL, no trigger logic.
--
-- Depends on: 20260302_01_tables.sql
-- ============================================================


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Returns the restaurant_id for the current authenticated user.
-- Fast path: reads the JWT claim injected by custom_jwt_claims().
-- Fallback: queries restaurant_members directly (works without the JWT hook,
-- or when the JWT hasn't been refreshed yet after adding a new restaurant).
-- For multi-restaurant users the fallback returns the most recently joined
-- restaurant — same tie-break used by custom_jwt_claims().
CREATE OR REPLACE FUNCTION auth_restaurant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'restaurant_id', '')::uuid,
    (
      SELECT restaurant_id
      FROM public.restaurant_members
      WHERE user_id   = auth.uid()
        AND is_active = true
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    )
  );
$$;

-- Returns the current user's role string from the JWT claim.
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() ->> 'user_role';
$$;

-- Returns true if the current user has any of the given roles.
CREATE OR REPLACE FUNCTION auth_has_role(roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'user_role') = ANY(roles);
$$;

-- Returns true if the current user is any authenticated staff member.
CREATE OR REPLACE FUNCTION auth_is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.role() = 'authenticated'
    AND (auth.jwt() ->> 'user_role') IS NOT NULL;
$$;


-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE restaurants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members      ENABLE ROW LEVEL SECURITY;
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


-- ============================================================
-- POLICIES
-- ============================================================

-- ─── restaurants ─────────────────────────────────────────────

CREATE POLICY "staff_select_own_restaurant"
  ON restaurants FOR SELECT
  USING (id = auth_restaurant_id());

-- Any authenticated user can create a restaurant (onboarding step 1).
-- The signup trigger also creates a placeholder automatically.
CREATE POLICY "owner_insert_restaurant"
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

-- Allows inserting settings for any restaurant the user is an owner of,
-- not just the currently-active one (needed when creating additional restaurants).
CREATE POLICY "owner_insert_settings"
  ON restaurant_settings FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id
      FROM public.restaurant_members
      WHERE user_id = auth.uid()
        AND role = 'owner'
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "owner_update_settings"
  ON restaurant_settings FOR UPDATE
  USING (restaurant_id = auth_restaurant_id() AND auth_has_role(ARRAY['owner', 'manager']))
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── user_profiles ───────────────────────────────────────────

CREATE POLICY "user_select_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Staff can see all profiles in their restaurant (staff management UI).
-- Membership is checked through restaurant_members, not user_profiles.
CREATE POLICY "staff_select_restaurant_profiles"
  ON user_profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id
      FROM public.restaurant_members
      WHERE restaurant_id = auth_restaurant_id()
        AND deleted_at IS NULL
    )
  );

-- Staff can update their own profile only.
CREATE POLICY "staff_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Owners/managers can update any profile within their restaurant.
CREATE POLICY "owner_update_any_profile"
  ON user_profiles FOR UPDATE
  USING (
    auth_has_role(ARRAY['owner', 'manager'])
    AND id IN (
      SELECT user_id
      FROM public.restaurant_members
      WHERE restaurant_id = auth_restaurant_id()
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    id IN (
      SELECT user_id
      FROM public.restaurant_members
      WHERE restaurant_id = auth_restaurant_id()
        AND deleted_at IS NULL
    )
  );


-- ─── restaurant_members ───────────────────────────────────────

-- Users can see their own memberships across all restaurants.
CREATE POLICY "user_select_own_memberships"
  ON restaurant_members FOR SELECT
  USING (user_id = auth.uid());

-- Staff can see all members within their currently-active restaurant.
CREATE POLICY "staff_select_restaurant_members"
  ON restaurant_members FOR SELECT
  USING (restaurant_id = auth_restaurant_id());

-- Owners can add/update/remove members within their restaurant.
CREATE POLICY "owner_manage_restaurant_members"
  ON restaurant_members FOR ALL
  USING (
    restaurant_id = auth_restaurant_id()
    AND auth_has_role(ARRAY['owner'])
  )
  WITH CHECK (
    restaurant_id = auth_restaurant_id()
    AND auth_has_role(ARRAY['owner'])
  );


-- ─── table_zones ─────────────────────────────────────────────

CREATE POLICY "staff_select_zones"
  ON table_zones FOR SELECT
  USING (restaurant_id = auth_restaurant_id());

CREATE POLICY "manager_manage_zones"
  ON table_zones FOR ALL
  USING (restaurant_id = auth_restaurant_id() AND auth_has_role(ARRAY['owner', 'manager']))
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── tables ──────────────────────────────────────────────────

-- Public: needed for QR scan to identify the table.
CREATE POLICY "public_select_active_tables"
  ON tables FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "staff_manage_tables"
  ON tables FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── qr_codes ────────────────────────────────────────────────

-- Public: needed to validate the token on QR scan.
CREATE POLICY "public_select_active_qr"
  ON qr_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "staff_manage_qr_codes"
  ON qr_codes FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── table_sessions ──────────────────────────────────────────

-- Public: customer needs the session_id to submit an order.
CREATE POLICY "public_select_open_sessions"
  ON table_sessions FOR SELECT
  USING (status = 'open');

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

-- Public: customers browse the menu without authenticating.
CREATE POLICY "public_select_visible_categories"
  ON menu_categories FOR SELECT
  USING (is_visible = true AND deleted_at IS NULL);

CREATE POLICY "staff_manage_categories"
  ON menu_categories FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── menu_items ──────────────────────────────────────────────

CREATE POLICY "public_select_menu_items"
  ON menu_items FOR SELECT
  USING (deleted_at IS NULL);

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

-- Customers (unauthenticated) can submit orders.
-- Session FK + open-status check (app level) prevent abuse.
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Customers can track their own session's orders.
CREATE POLICY "public_select_own_session_orders"
  ON orders FOR SELECT
  USING (
    auth.role() = 'anon'
    AND session_id IN (
      SELECT id FROM table_sessions WHERE status IN ('open', 'bill_requested')
    )
  );

CREATE POLICY "staff_select_restaurant_orders"
  ON orders FOR SELECT
  USING (restaurant_id = auth_restaurant_id());

CREATE POLICY "staff_update_orders"
  ON orders FOR UPDATE
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── order_items ─────────────────────────────────────────────

CREATE POLICY "public_insert_order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Customers can read items from their active session.
CREATE POLICY "public_select_open_session_order_items"
  ON order_items FOR SELECT
  USING (
    auth.role() = 'anon'
    AND order_id IN (
      SELECT o.id FROM orders o
      JOIN table_sessions s ON o.session_id = s.id
      WHERE s.status IN ('open', 'bill_requested')
    )
  );

CREATE POLICY "staff_manage_order_items"
  ON order_items FOR ALL
  USING (restaurant_id = auth_restaurant_id())
  WITH CHECK (restaurant_id = auth_restaurant_id());


-- ─── order_item_variants & modifiers ─────────────────────────

CREATE POLICY "public_insert_order_item_variants"
  ON order_item_variants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "staff_select_order_item_variants"
  ON order_item_variants FOR SELECT
  USING (
    order_item_id IN (
      SELECT id FROM order_items WHERE restaurant_id = auth_restaurant_id()
    )
  );

CREATE POLICY "public_insert_order_item_modifiers"
  ON order_item_modifiers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "staff_select_order_item_modifiers"
  ON order_item_modifiers FOR SELECT
  USING (
    order_item_id IN (
      SELECT id FROM order_items WHERE restaurant_id = auth_restaurant_id()
    )
  );


-- ─── payments ────────────────────────────────────────────────

-- Only cashier/owner/manager can process payments.
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

-- All staff can read payments (order history, reports).
CREATE POLICY "staff_select_payments"
  ON payments FOR SELECT
  USING (restaurant_id = auth_restaurant_id());


-- ─── receipts ────────────────────────────────────────────────

-- Public: view_token acts as the access control (unguessable random string).
-- Frontend filters by view_token, not by id.
CREATE POLICY "public_select_receipt_by_token"
  ON receipts FOR SELECT
  USING (true);

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
      target_user_id = auth.uid()       -- notification for this specific user
      OR target_role = auth_user_role() -- notification for this role
      OR target_role IS NULL            -- broadcast to all staff
    )
  );

CREATE POLICY "staff_update_own_notifications"
  ON notifications FOR UPDATE
  USING (target_user_id = auth.uid() OR restaurant_id = auth_restaurant_id())
  WITH CHECK (true);


-- ─── activity_logs ───────────────────────────────────────────

-- Owner/manager only — floor staff cannot read audit logs.
CREATE POLICY "manager_select_activity_logs"
  ON activity_logs FOR SELECT
  USING (
    restaurant_id = auth_restaurant_id()
    AND auth_has_role(ARRAY['owner', 'manager'])
  );
