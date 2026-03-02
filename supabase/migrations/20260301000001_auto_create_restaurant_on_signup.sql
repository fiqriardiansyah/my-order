-- ============================================================
-- Auto-create a placeholder restaurant when a new user registers.
--
-- Problem: the old trigger created user_profiles with restaurant_id = NULL.
-- Any onboarding INSERT into restaurants was blocked by RLS because the
-- JWT had no restaurant_id claim yet.
--
-- Fix: create the restaurant *inside* the trigger (SECURITY DEFINER bypasses
-- RLS) and link user_profiles.restaurant_id immediately. The JWT issued at
-- sign-in then already carries the restaurant_id claim, so all subsequent
-- onboarding UPDATEs/INSERTs pass RLS without needing a session refresh.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restaurant_id UUID;
BEGIN
  -- Create a placeholder restaurant row.
  -- slug = user UUID → guaranteed unique, replaced by the real slug on onboarding.
  -- name = '' → satisfies NOT NULL, replaced on onboarding.
  INSERT INTO public.restaurants (name, slug)
  VALUES ('', NEW.id::text)
  RETURNING id INTO v_restaurant_id;

  -- Create the user profile already linked to the new restaurant.
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
