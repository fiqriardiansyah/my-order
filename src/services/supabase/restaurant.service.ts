import { supabase } from "@/lib/supabase";
import type {
  RestaurantInput,
  RestaurantRecord,
} from "../interfaces/restaurant.interface";

export async function getUniqueSlug(baseSlug: string): Promise<string> {
  // Fetch all slugs that are exactly baseSlug or start with baseSlug-
  const { data } = await supabase
    .from("restaurants")
    .select("slug")
    .or(`slug.eq.${baseSlug},slug.like.${baseSlug}-%`);

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
