import { supabase } from "@/lib/supabase";
import type { ZoneRecord, TableInput } from "../interfaces/tables.interface";

export async function createTableZones(
  restaurantId: string,
  zoneNames: string[]
): Promise<ZoneRecord[]> {
  if (zoneNames.length === 0) return [];

  const { data, error } = await supabase
    .from("table_zones")
    .insert(
      zoneNames.map((name, i) => ({
        restaurant_id: restaurantId,
        name,
        sort_order: i,
      }))
    )
    .select("id, name");

  if (error) throw error;
  return data;
}

export async function createTables(
  restaurantId: string,
  tables: TableInput[]
): Promise<void> {
  if (tables.length === 0) return;

  const { error } = await supabase.from("tables").insert(
    tables.map((t) => ({
      restaurant_id: restaurantId,
      name: t.name,
      slug: t.slug,
      sort_order: t.sort_order,
      zone_id: t.zone_id,
      is_active: true,
    }))
  );

  if (error) throw error;
}
