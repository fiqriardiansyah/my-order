// ─── Menu ─────────────────────────────────────────────────────────────────────

export interface MenuWithCount {
  id: string;
  name: string;
  is_active: boolean;
  is_default: boolean;
  category_count: number;
}

// ─── Menu Category ─────────────────────────────────────────────────────────────

export interface MenuCategoryDetail {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_visible: boolean;
  sort_order: number;
  item_count: number;
}

// ─── Menu Item ─────────────────────────────────────────────────────────────────

export interface MenuItemRow {
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
  variant_count: number;
  modifier_count: number;
}

export type StatusFilter = "all" | "available" | "unavailable";
