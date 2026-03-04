import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MenuCategoryDetail } from "@/@types/menu";

export type { MenuCategoryDetail };

// ─── types ────────────────────────────────────────────────────────────────────

export interface CreateMenuCategoryValues {
  restaurantId: string;
  menuId: string;
  name: string;
  description?: string;
  is_visible?: boolean;
}

// ─── queries ──────────────────────────────────────────────────────────────────

export function useMenuCategories(
  restaurantId: string | null | undefined,
  menuIds: string[] | null = null,
) {
  return useQuery({
    queryKey: ["menu-categories", restaurantId, menuIds],
    enabled: !!restaurantId && menuIds !== null,
    queryFn: async () => {
      let query = supabase
        .from("menu_categories")
        .select("id, name, is_visible")
        .eq("restaurant_id", restaurantId!)
        .is("deleted_at", null)
        .order("sort_order");
      if (menuIds!.length > 0) {
        query = query.in("menu_id", menuIds!);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMenuCategoriesDetail(
  restaurantId: string | null | undefined,
  menuId: string | null,
) {
  return useQuery({
    queryKey: ["menu-categories-detail", restaurantId, menuId],
    enabled: !!restaurantId && !!menuId,
    queryFn: async () => {
      const [catsRes, itemsRes] = await Promise.all([
        supabase
          .from("menu_categories")
          .select("id, name, description, image_url, is_visible, sort_order")
          .eq("restaurant_id", restaurantId!)
          .eq("menu_id", menuId!)
          .is("deleted_at", null)
          .order("sort_order"),
        supabase
          .from("menu_items")
          .select("id, category_id")
          .eq("restaurant_id", restaurantId!)
          .is("deleted_at", null),
      ]);
      if (catsRes.error) throw catsRes.error;
      if (itemsRes.error) throw itemsRes.error;
      const countByCat = (itemsRes.data ?? []).reduce<Record<string, number>>(
        (acc, item) => ({
          ...acc,
          [item.category_id]: (acc[item.category_id] ?? 0) + 1,
        }),
        {},
      );
      return (catsRes.data ?? []).map((c) => ({
        ...c,
        item_count: countByCat[c.id] ?? 0,
      })) as MenuCategoryDetail[];
    },
  });
}

// ─── mutations ────────────────────────────────────────────────────────────────

export function useCreateMenuCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      restaurantId,
      menuId,
      name,
      description,
      is_visible = true,
    }: CreateMenuCategoryValues) => {
      const { data, error } = await supabase
        .from("menu_categories")
        .insert({
          restaurant_id: restaurantId,
          menu_id: menuId,
          name,
          description: description || null,
          is_visible,
        })
        .select("id, name")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { restaurantId, menuId }) => {
      queryClient.invalidateQueries({
        queryKey: ["menu-categories", restaurantId, menuId],
      });
      queryClient.invalidateQueries({
        queryKey: ["menu-categories-detail", restaurantId, menuId],
      });
    },
  });
}

export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      is_visible,
    }: {
      id: string;
      name: string;
      description?: string;
      is_visible: boolean;
    }) => {
      const { error } = await supabase
        .from("menu_categories")
        .update({
          name,
          description: description || null,
          is_visible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-categories-detail"] });
    },
  });
}

export function useDeleteMenuCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_categories")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-categories-detail"] });
    },
  });
}
