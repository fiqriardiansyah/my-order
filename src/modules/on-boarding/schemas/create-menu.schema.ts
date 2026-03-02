import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  base_price: z.coerce.number().min(0, "Price must be 0 or more").default(0),
  is_available: z.boolean().default(true),
});

export const menuCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().default("🍽️"),
  items: z.array(menuItemSchema).default([]),
});

export const createMenuSchema = z.object({
  menu_name: z.string().min(1, "Menu name is required").default("Main Menu"),
  categories: z
    .array(menuCategorySchema)
    .min(1, "Add at least one category to continue"),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
export type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>;
export type CreateMenuFormValues = z.infer<typeof createMenuSchema>;
