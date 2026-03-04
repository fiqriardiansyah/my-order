import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ─── types ────────────────────────────────────────────────────────────────────

export interface MenuWithCount {
  id: string;
  name: string;
  is_active: boolean;
  is_default: boolean;
  category_count: number;
}

export interface CreateMenuValues {
  restaurantId: string;
  name: string;
  is_active: boolean;
  is_default: boolean;
}

// ─── queries ──────────────────────────────────────────────────────────────────

export function useMenus(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ["menus", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("id, name, is_default, is_active")
        .eq("restaurant_id", restaurantId!)
        .is("deleted_at", null)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMenusWithCount(restaurantId: string | null | undefined) {
  return useQuery({
    queryKey: ["menus-with-count", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const [menusRes, catsRes] = await Promise.all([
        supabase
          .from("menus")
          .select("id, name, is_active, is_default")
          .eq("restaurant_id", restaurantId!)
          .is("deleted_at", null)
          .order("created_at"),
        supabase
          .from("menu_categories")
          .select("id, menu_id")
          .eq("restaurant_id", restaurantId!)
          .is("deleted_at", null),
      ]);
      if (menusRes.error) throw menusRes.error;
      if (catsRes.error) throw catsRes.error;
      const countByMenu = (catsRes.data ?? []).reduce<Record<string, number>>(
        (acc, c) => ({ ...acc, [c.menu_id]: (acc[c.menu_id] ?? 0) + 1 }),
        {},
      );
      return (menusRes.data ?? []).map((m) => ({
        ...m,
        category_count: countByMenu[m.id] ?? 0,
      })) as MenuWithCount[];
    },
  });
}

// ─── mutations ────────────────────────────────────────────────────────────────

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ restaurantId, name, is_active, is_default }: CreateMenuValues) => {
      const { data, error } = await supabase
        .from("menus")
        .insert({ restaurant_id: restaurantId, name, is_active, is_default })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus-with-count"] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, is_active }: { id: string; name: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("menus")
        .update({ name, is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus-with-count"] });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menus")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menus-with-count"] });
    },
  });
}
