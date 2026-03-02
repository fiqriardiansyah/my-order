-- ============================================================
-- FIX: Signup failure + RLS errors on onboarding
-- ============================================================

-- 1. Allow user_profiles.restaurant_id to be NULL.
--    On signup there is no restaurant yet — the trigger was failing
--    because it tried to insert NULL into a NOT NULL column.
ALTER TABLE user_profiles
  ALTER COLUMN restaurant_id DROP NOT NULL;

-- 2. Allow authenticated users to INSERT a restaurant (onboarding step 1).
--    The restaurants table had no INSERT policy, blocking createRestaurant().
CREATE POLICY "owner_insert_restaurant"
  ON restaurants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Fix trigger: new self-registrations are restaurant owners, not floor staff.
--    The old default 'floor_staff' caused the JWT to carry the wrong role,
--    which blocked menu/zone/table inserts that check auth_has_role().
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
    NULLIF(NEW.raw_user_meta_data ->> 'restaurant_id', '')::uuid,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'owner'),
    true
  );
  RETURN NEW;
END;
$$;

