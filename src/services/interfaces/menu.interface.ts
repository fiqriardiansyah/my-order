export interface MenuItemInput {
  name: string;
  base_price: number;
  is_available: boolean;
  sort_order: number;
}

export interface MenuCategoryInput {
  name: string;
  sort_order: number;
  items: MenuItemInput[];
}

export interface MenuInput {
  name: string;
  categories: MenuCategoryInput[];
}

export interface IMenuService {
  createMenu(restaurantId: string, input: MenuInput): Promise<void>;
}
