import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MenuItemFormValues } from "@/modules/menu/schemas/menu-item.schema";
import type { MenuItemRow, StatusFilter } from "@/@types/menu";

export type { MenuItemRow, StatusFilter };

// ─── types ────────────────────────────────────────────────────────────────────

export interface MenuItemDetail {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  category_id: string;
  menu_id: string;
  variants: { id: string; name: string; price_modifier: number }[];
  modifiers: { id: string; name: string; price_modifier: number }[];
}

interface UseMenuItemsParams {
  restaurantId: string | null | undefined;
  menuIds: string[];
  search: string;
  categoryIds: string[];
  status: StatusFilter;
  page: number;
  pageSize: number;
  /** Active menu IDs used to filter out items from inactive menus. null = still loading (query stays disabled). */
  activeMenuIds: string[] | null;
}

interface RawMenuItemResult {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  is_available: boolean;
  category: {
    id: string;
    name: string;
    menu: { id: string; name: string } | null;
  } | null;
  menu_item_variants: { id: string }[];
  menu_item_modifiers: { id: string }[];
}

// ─── queries ──────────────────────────────────────────────────────────────────

export function useMenuItems({
  restaurantId,
  menuIds,
  search,
  categoryIds,
  status,
  page,
  pageSize,
  activeMenuIds,
}: UseMenuItemsParams) {
  return useQuery({
    queryKey: [
      "menu-items",
      restaurantId,
      menuIds,
      search,
      categoryIds,
      status,
      page,
      pageSize,
      activeMenuIds,
    ],
    enabled: !!restaurantId && activeMenuIds !== null,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const effectiveMenuIds = menuIds.length > 0 ? menuIds : activeMenuIds!;

      const categoryJoin =
        effectiveMenuIds.length > 0
          ? "category:menu_categories!inner(id, name, menu:menus(id, name))"
          : "category:menu_categories!menu_items_category_id_fkey(id, name, menu:menus(id, name))";

      let query = supabase
        .from("menu_items")
        .select(
          `id, name, description, image_url, base_price, is_available,
          ${categoryJoin},
          menu_item_variants(id),
          menu_item_modifiers(id)`,
          { count: "exact" },
        )
        .eq("restaurant_id", restaurantId!)
        .is("deleted_at", null)
        .eq("menu_categories.is_visible", true)
        .order("name")
        .range(from, to);

      if (effectiveMenuIds.length > 0) {
        query = query.in("menu_categories.menu_id", effectiveMenuIds);
      }
      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }
      if (categoryIds.length > 0) {
        query = query.in("category_id", categoryIds);
      }
      if (status === "available") {
        query = query.eq("is_available", true);
      } else if (status === "unavailable") {
        query = query.eq("is_available", false);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      const items: MenuItemRow[] = ((data ?? []) as RawMenuItemResult[]).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image_url: item.image_url,
        base_price: item.base_price,
        is_available: item.is_available,
        category: item.category
          ? {
              id: item.category.id,
              name: item.category.name,
              menu: item.category.menu ?? null,
            }
          : null,
        variant_count: Array.isArray(item.menu_item_variants)
          ? item.menu_item_variants.length
          : 0,
        modifier_count: Array.isArray(item.menu_item_modifiers)
          ? item.menu_item_modifiers.length
          : 0,
      }));

      return { items, total: count ?? 0 };
    },
  });
}

export function useMenuItemDetail(id: string | null) {
  return useQuery({
    queryKey: ["menu-item-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select(
          `id, name, description, base_price, image_url,
           is_available, is_featured, category_id,
           category:menu_categories!menu_items_category_id_fkey(menu_id),
           menu_item_variants(id, option_name, price_modifier, sort_order),
           menu_item_modifiers(id, name, price_modifier, sort_order)`,
        )
        .eq("id", id!)
        .is("deleted_at", null)
        .single();
      if (error) throw error;
      const detail: MenuItemDetail = {
        id: data.id,
        name: data.name,
        description: data.description,
        base_price: data.base_price,
        image_url: data.image_url,
        is_available: data.is_available,
        is_featured: data.is_featured,
        category_id: data.category_id,
        menu_id: data.category?.menu_id ?? "",
        variants: data.menu_item_variants
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((v) => ({
            id: v.id,
            name: v.option_name,
            price_modifier: v.price_modifier,
          })),
        modifiers: data.menu_item_modifiers
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((m) => ({
            id: m.id,
            name: m.name,
            price_modifier: m.price_modifier,
          })),
      };
      return detail;
    },
  });
}

// ─── mutations ────────────────────────────────────────────────────────────────

export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, is_available }) => {
      await queryClient.cancelQueries({ queryKey: ["menu-items"] });

      const previousEntries = queryClient.getQueriesData<{
        items: MenuItemRow[];
        total: number;
      }>({ queryKey: ["menu-items"] });

      queryClient.setQueriesData<{ items: MenuItemRow[]; total: number }>(
        { queryKey: ["menu-items"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, is_available } : item,
            ),
          };
        },
      );

      return { previousEntries };
    },
    onError: (_err, _vars, context) => {
      context?.previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      restaurantId,
      values,
    }: {
      restaurantId: string;
      values: MenuItemFormValues;
    }) => {
      const { data: item, error } = await supabase
        .from("menu_items")
        .insert({
          restaurant_id: restaurantId,
          name: values.name,
          description: values.description || null,
          base_price: values.base_price,
          image_url: values.image_url ?? null,
          is_available: values.is_available,
          is_featured: values.is_featured,
          category_id: values.category_id,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (values.variants.length > 0) {
        const { error: variantsError } = await supabase
          .from("menu_item_variants")
          .insert(
            values.variants.map((v, i) => ({
              menu_item_id: item.id,
              restaurant_id: restaurantId,
              group_name: "Default",
              option_name: v.name,
              price_modifier: v.price_modifier,
              sort_order: i,
            })),
          );
        if (variantsError) throw variantsError;
      }

      if (values.modifiers.length > 0) {
        const { error: modifiersError } = await supabase
          .from("menu_item_modifiers")
          .insert(
            values.modifiers.map((m, i) => ({
              menu_item_id: item.id,
              restaurant_id: restaurantId,
              name: m.name,
              price_modifier: m.price_modifier,
              sort_order: i,
            })),
          );
        if (modifiersError) throw modifiersError;
      }

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      restaurantId,
      values,
    }: {
      id: string;
      restaurantId: string;
      values: MenuItemFormValues;
    }) => {
      const { error: itemError } = await supabase
        .from("menu_items")
        .update({
          name: values.name,
          description: values.description || null,
          base_price: values.base_price,
          image_url: values.image_url ?? null,
          is_available: values.is_available,
          is_featured: values.is_featured,
          category_id: values.category_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (itemError) throw itemError;

      const { error: delVariants } = await supabase
        .from("menu_item_variants")
        .delete()
        .eq("menu_item_id", id);
      if (delVariants) throw delVariants;

      if (values.variants.length > 0) {
        const { error: insVariants } = await supabase
          .from("menu_item_variants")
          .insert(
            values.variants.map((v, i) => ({
              menu_item_id: id,
              restaurant_id: restaurantId,
              group_name: "Default",
              option_name: v.name,
              price_modifier: v.price_modifier,
              sort_order: i,
            })),
          );
        if (insVariants) throw insVariants;
      }

      const { error: delModifiers } = await supabase
        .from("menu_item_modifiers")
        .delete()
        .eq("menu_item_id", id);
      if (delModifiers) throw delModifiers;

      if (values.modifiers.length > 0) {
        const { error: insModifiers } = await supabase
          .from("menu_item_modifiers")
          .insert(
            values.modifiers.map((m, i) => ({
              menu_item_id: id,
              restaurant_id: restaurantId,
              name: m.name,
              price_modifier: m.price_modifier,
              sort_order: i,
            })),
          );
        if (insModifiers) throw insModifiers;
      }
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-item-detail", id] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}
