import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { generateTables } from "../steps/setup-tables/utils";
import type { RestaurantProfileFormValues } from "../schemas/restaurant-profile.schema";
import type { CreateMenuFormValues } from "../schemas/create-menu.schema";
import type { SetupTablesFormValues } from "../schemas/setup-tables.schema";

// ─── helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let query = supabase
    .from("restaurants")
    .select("slug")
    .or(`slug.eq.${baseSlug},slug.like.${baseSlug}-%`);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query;
  if (!data || data.length === 0) return baseSlug;

  const existing = new Set(data.map((r) => r.slug));
  if (!existing.has(baseSlug)) return baseSlug;

  let n = 2;
  while (existing.has(`${baseSlug}-${n}`)) n++;
  return `${baseSlug}-${n}`;
}

// ─── save onboarding ──────────────────────────────────────────────────────────

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

  // 2. Update the pre-created placeholder restaurant, or create one if missing.
  let restaurantId = membership?.restaurant_id ?? null;

  const restaurantData = {
    name: restaurantProfile.name,
    slug: await getUniqueSlug(slugify(restaurantProfile.name), restaurantId ?? undefined),
    logo_url: restaurantProfile.logo_url || null,
    address: restaurantProfile.address || null,
    phone: restaurantProfile.phone || null,
    currency: restaurantProfile.currency,
    timezone: restaurantProfile.timezone,
    country_code: restaurantProfile.country_code,
  };

  if (restaurantId) {
    const { error } = await supabase
      .from("restaurants")
      .update(restaurantData)
      .eq("id", restaurantId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("restaurants")
      .insert(restaurantData)
      .select("id")
      .single();
    if (error) throw error;
    restaurantId = data.id;
    await supabase
      .from("restaurant_members")
      .insert({ restaurant_id: restaurantId, user_id: user.id, role: "owner" });
  }

  // Refresh the JWT so the restaurant_id claim is present for all subsequent RLS checks.
  await supabase.auth.refreshSession();

  // 3 + 4a. Save menu and zones in parallel (independent operations)
  const { count, namingStyle, zones } = tables;

  async function createMenuWithCategories() {
    const { data: menuRecord, error: menuError } = await supabase
      .from("menus")
      .insert({ restaurant_id: restaurantId!, name: menu.menu_name, is_default: true })
      .select("id")
      .single();
    if (menuError) throw menuError;

    if (menu.categories.length === 0) return;

    const { data: categories, error: catError } = await supabase
      .from("menu_categories")
      .insert(
        menu.categories.map((cat, i) => ({
          menu_id: menuRecord.id,
          restaurant_id: restaurantId!,
          name: cat.name,
          sort_order: i,
        })),
      )
      .select("id");
    if (catError) {
      await supabase.from("menus").delete().eq("id", menuRecord.id);
      throw catError;
    }

    const allItems = menu.categories.flatMap((cat, catIdx) =>
      cat.items.map((item, j) => ({
        category_id: categories[catIdx].id,
        restaurant_id: restaurantId!,
        name: item.name,
        base_price: item.base_price,
        is_available: item.is_available,
        sort_order: j,
      })),
    );

    if (allItems.length > 0) {
      const { error: itemsError } = await supabase.from("menu_items").insert(allItems);
      if (itemsError) {
        await supabase.from("menus").delete().eq("id", menuRecord.id);
        throw itemsError;
      }
    }
  }

  async function createZones() {
    if (zones.length === 0) return [];
    const { data, error } = await supabase
      .from("table_zones")
      .insert(zones.map((name, i) => ({ restaurant_id: restaurantId!, name, sort_order: i })))
      .select("id, name");
    if (error) throw error;
    return data;
  }

  const [, zoneRecords] = await Promise.all([createMenuWithCategories(), createZones()]);

  // 4b. Save tables (depends on zone IDs from step 4a)
  const zoneIdMap = new Map((zoneRecords ?? []).map((z) => [z.name, z.id]));
  const generated = generateTables(count, namingStyle, zones);

  if (generated.length > 0) {
    const { error } = await supabase.from("tables").insert(
      generated.map((t) => ({
        restaurant_id: restaurantId!,
        name: t.name,
        slug: t.slug,
        sort_order: t.sort_order,
        zone_id: t.zone ? (zoneIdMap.get(t.zone) ?? null) : null,
        is_active: true,
      })),
    );
    if (error) throw error;
  }
}

export function useSaveOnboarding() {
  return useMutation({ mutationFn: saveOnboarding });
}
