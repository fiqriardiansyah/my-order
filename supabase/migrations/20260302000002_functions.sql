-- ============================================================
-- FUNCTIONS & TRIGGERS
-- Migration: 20260302_02_functions.sql
--
-- Contains: all trigger functions, their CREATE TRIGGER bindings,
-- and the custom JWT claims auth hook.
-- Nothing else — no DDL, no policies.
--
-- Depends on: 20260302_01_tables.sql
-- ============================================================


-- ============================================================
-- TRIGGER 1: Auto-create restaurant + user_profile on signup
-- ============================================================
-- When a user calls supabase.auth.signUp(), Supabase inserts a row
-- into auth.users. This trigger fires immediately after and:
--   1. Creates a placeholder restaurant (slug = user UUID, name = '').
--   2. Creates the user_profiles row already linked to that restaurant.
--
-- The JWT issued at sign-in then carries restaurant_id from the start,
-- so all onboarding inserts/updates pass RLS without a session refresh.
-- The real slug and name are filled in during onboarding step 1.

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restaurant_id UUID;
BEGIN
  INSERT INTO public.restaurants (name, slug)
  VALUES ('', NEW.id::text)
  RETURNING id INTO v_restaurant_id;

  INSERT INTO public.user_profiles (
    id,
    restaurant_id,
    full_name,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    v_restaurant_id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'owner',
    true
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();


-- ============================================================
-- TRIGGER 2: Snapshot tax rates on order creation
-- ============================================================
-- Copies the restaurant's current tax/service rates into the order row.
-- Changing tax settings later has no effect on past orders.

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


-- ============================================================
-- TRIGGER 3: Auto-generate order number
-- ============================================================
-- Generates human-readable order numbers: 'ORD-0001', 'ORD-0042'.
-- Uses a global sequence (global_order_seq defined in 01_tables.sql).

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


-- ============================================================
-- TRIGGER 4: Recalculate order totals
-- ============================================================
-- Fires after order_items are inserted, updated, or deleted.
-- Keeps orders.subtotal, tax_amount, service_amount, total_amount accurate.
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
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(subtotal), 0)
  INTO v_subtotal
  FROM order_items
  WHERE order_id = v_order_id;

  SELECT tax_rate_snapshot, service_rate_snapshot
  INTO v_tax_rate, v_service_rate
  FROM orders
  WHERE id = v_order_id;

  v_tax_amount     := ROUND(v_subtotal * (v_tax_rate / 100), 0);
  v_service_amount := ROUND(v_subtotal * (v_service_rate / 100), 0);

  UPDATE orders
  SET
    subtotal       = v_subtotal,
    tax_amount     = v_tax_amount,
    service_amount = v_service_amount,
    total_amount   = v_subtotal + v_tax_amount + v_service_amount - discount_amount,
    updated_at     = NOW()
  WHERE id = v_order_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_recalculate_order_totals
  AFTER INSERT OR UPDATE OF quantity, unit_price, subtotal OR DELETE
  ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_order_totals();


-- ============================================================
-- TRIGGER 5: Auto-sync order status from kitchen items
-- ============================================================
-- When ALL order_items for an order reach 'ready', the parent
-- order status is automatically promoted to 'ready'.

CREATE OR REPLACE FUNCTION sync_order_status_from_kitchen()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_items   INTEGER;
  v_ready_items   INTEGER;
  v_order_status  VARCHAR(30);
BEGIN
  IF NEW.kitchen_status = OLD.kitchen_status THEN
    RETURN NEW;
  END IF;

  SELECT status INTO v_order_status
  FROM orders WHERE id = NEW.order_id;

  IF v_order_status NOT IN ('confirmed', 'preparing') THEN
    RETURN NEW;
  END IF;

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE kitchen_status = 'ready')
  INTO v_total_items, v_ready_items
  FROM order_items
  WHERE order_id = NEW.order_id;

  IF NEW.kitchen_status = 'preparing' AND v_order_status = 'confirmed' THEN
    UPDATE orders
    SET status = 'preparing', updated_at = NOW()
    WHERE id = NEW.order_id;

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


-- ============================================================
-- TRIGGER 6: Auto-update updated_at timestamps
-- ============================================================

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

CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_menu_items
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- AUTH HOOK: Custom JWT claims
-- ============================================================
-- Called by Supabase every time a JWT is issued.
-- Adds restaurant_id and user_role to the token claims so RLS
-- policies can use auth.jwt() ->> 'restaurant_id' directly
-- without a database roundtrip.
--
-- HOW TO ACTIVATE:
--   Supabase Dashboard → Authentication → Hooks
--   → Set "Custom Access Token Hook" to: public.custom_jwt_claims

CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile  RECORD;
  claims        JSONB;
BEGIN
  SELECT restaurant_id, role, is_active
  INTO user_profile
  FROM public.user_profiles
  WHERE id = (event ->> 'user_id')::uuid;

  -- No profile yet (e.g. signup trigger hasn't fired) — return unchanged
  IF NOT FOUND THEN
    RETURN event;
  END IF;

  -- Deactivated account — omit claims so app layer detects unauthorized state
  IF NOT user_profile.is_active THEN
    RETURN event;
  END IF;

  claims := event -> 'claims';
  claims := jsonb_set(claims, '{restaurant_id}', to_jsonb(user_profile.restaurant_id::text));
  claims := jsonb_set(claims, '{user_role}',     to_jsonb(user_profile.role));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;
