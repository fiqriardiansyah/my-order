import { supabase } from "@/lib/supabase";
import type {
  RestaurantInput,
  RestaurantRecord,
} from "../interfaces/restaurant.interface";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getUniqueSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  // Fetch all slugs that are exactly baseSlug or start with baseSlug-,
  // excluding the restaurant being updated so it doesn't conflict with itself.
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

export async function createRestaurant(
  input: RestaurantInput
): Promise<RestaurantRecord> {
  const { data, error } = await supabase
    .from("restaurants")
    .insert(input)
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function updateRestaurant(
  id: string,
  input: RestaurantInput
): Promise<void> {
  const { error } = await supabase
    .from("restaurants")
    .update(input)
    .eq("id", id);

  if (error) throw error;
}
