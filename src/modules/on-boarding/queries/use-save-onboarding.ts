import { useMutation } from "@tanstack/react-query";
import { createRestaurant, updateRestaurant, getUniqueSlug, slugify } from "@/services/restaurant";
import { createMenu } from "@/services/menu";
import { createTableZones, createTables } from "@/services/tables";
import { generateTables } from "../steps/setup-tables/utils";
import { supabase } from "@/lib/supabase";
import type { RestaurantProfileFormValues } from "../schemas/restaurant-profile.schema";
import type { CreateMenuFormValues } from "../schemas/create-menu.schema";
import type { SetupTablesFormValues } from "../schemas/setup-tables.schema";

interface SaveOnboardingInput {
  restaurantProfile: RestaurantProfileFormValues;
  menu: CreateMenuFormValues;
  tables: SetupTablesFormValues;
}

async function saveOnboarding({
  restaurantProfile,
  menu,
  tables,
}: SaveOnboardingInput): Promise<void> {
  // 1. Get the restaurant_id from restaurant_members (pre-created at signup via DB trigger).
  //    The JWT already carries this claim so all RLS checks pass immediately.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: membership, error: membershipError } = await supabase
    .from("restaurant_members")
    .select("restaurant_id")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;

  // 2. Update the pre-created placeholder restaurant, or create one for users
  //    who signed up before the auto-create trigger was deployed.
  let restaurantId = membership?.restaurant_id ?? null;

  const restaurantData = {
    name: restaurantProfile.name,
    slug: await getUniqueSlug(
      slugify(restaurantProfile.name),
      restaurantId ?? undefined,
    ),
    logo_url: restaurantProfile.logo_url || null,
    address: restaurantProfile.address || null,
    phone: restaurantProfile.phone || null,
    currency: restaurantProfile.currency,
    timezone: restaurantProfile.timezone,
    country_code: restaurantProfile.country_code,
  };
  if (restaurantId) {
    await updateRestaurant(restaurantId, restaurantData);
  } else {
    const { id } = await createRestaurant(restaurantData);
    restaurantId = id;
    await supabase
      .from("restaurant_members")
      .insert({ restaurant_id: restaurantId, user_id: user.id, role: "owner" });
  }

  // Refresh the JWT so the restaurant_id claim is present for all subsequent
  // RLS checks (menus, categories, items, zones, tables).
  await supabase.auth.refreshSession();

  // 3 + 4a. Save menu and zones in parallel (independent operations)
  const { count, namingStyle, zones } = tables;
  const [, zoneRecords] = await Promise.all([
    createMenu(restaurantId, {
      name: menu.menu_name,
      categories: menu.categories.map((cat, i) => ({
        name: cat.name,
        sort_order: i,
        items: cat.items.map((item, j) => ({
          name: item.name,
          base_price: item.base_price,
          is_available: item.is_available,
          sort_order: j,
        })),
      })),
    }),
    createTableZones(restaurantId, zones),
  ]);

  // 4b. Save tables (depends on zone IDs from step 4a)

  const zoneIdMap = new Map(zoneRecords.map((z) => [z.name, z.id]));
  const generated = generateTables(count, namingStyle, zones);
  await createTables(
    restaurantId,
    generated.map((t) => ({
      name: t.name,
      slug: t.slug,
      sort_order: t.sort_order,
      zone_id: t.zone ? (zoneIdMap.get(t.zone) ?? null) : null,
    }))
  );
}

export function useSaveOnboarding() {
  return useMutation({ mutationFn: saveOnboarding });
}
