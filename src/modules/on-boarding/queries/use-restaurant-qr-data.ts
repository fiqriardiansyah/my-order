import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface RestaurantTable {
  id: string;
  name: string;
  slug: string;
}

export interface RestaurantQrData {
  tables: RestaurantTable[];
  tablesCount: number;
  categoriesCount: number;
  itemsCount: number;
  activeMenusCount: number;
}

export function useRestaurantQrData(restaurantId: string | null | undefined) {
  return useQuery<RestaurantQrData>({
    queryKey: ["restaurant-qr-data", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const [
        tablesResult,
        categoriesResult,
        itemsResult,
        menusResult,
      ] = await Promise.all([
        supabase
          .from("tables")
          .select("id, name, slug")
          .eq("restaurant_id", restaurantId!)
          .is("deleted_at", null)
          .order("sort_order"),
        supabase
          .from("menu_categories")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId!)
          .is("deleted_at", null),
        supabase
          .from("menu_items")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId!)
          .is("deleted_at", null),
        supabase
          .from("menus")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId!)
          .eq("is_active", true)
          .is("deleted_at", null),
      ]);

      if (tablesResult.error) throw tablesResult.error;

      const tables = (tablesResult.data ?? []) as RestaurantTable[];

      return {
        tables,
        tablesCount: tables.length,
        categoriesCount: categoriesResult.count ?? 0,
        itemsCount: itemsResult.count ?? 0,
        activeMenusCount: menusResult.count ?? 0,
      };
    },
  });
}
