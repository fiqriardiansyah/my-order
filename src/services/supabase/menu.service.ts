import { supabase } from "@/lib/supabase";
import type { MenuInput } from "../interfaces/menu.interface";

async function rollbackMenu(menuId: string): Promise<void> {
  // Deleting the menu cascades to menu_categories and menu_items
  await supabase.from("menus").delete().eq("id", menuId);
}

export async function createMenu(
  restaurantId: string,
  input: MenuInput
): Promise<void> {
  // 1. Insert menu
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .insert({
      restaurant_id: restaurantId,
      name: input.name,
      is_default: true,
    })
    .select("id")
    .single();

  if (menuError) throw menuError;

  // 2. Insert categories
  if (input.categories.length === 0) return;

  const { data: categories, error: catError } = await supabase
    .from("menu_categories")
    .insert(
      input.categories.map((c) => ({
        menu_id: menu.id,
        restaurant_id: restaurantId,
        name: c.name,
        sort_order: c.sort_order,
      }))
    )
    .select("id");

  if (catError) {
    await rollbackMenu(menu.id);
    throw catError;
  }

  // 3. Insert items
  const allItems = input.categories.flatMap((cat, catIdx) =>
    cat.items.map((item) => ({
      category_id: categories[catIdx].id,
      restaurant_id: restaurantId,
      name: item.name,
      base_price: item.base_price,
      is_available: item.is_available,
      sort_order: item.sort_order,
    }))
  );

  if (allItems.length === 0) return;

  const { error: itemsError } = await supabase
    .from("menu_items")
    .insert(allItems);

  if (itemsError) {
    await rollbackMenu(menu.id);
    throw itemsError;
  }
}
