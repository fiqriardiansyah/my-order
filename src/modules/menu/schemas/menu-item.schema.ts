import { z } from "zod";

export const variantSchema = z.object({
  name: z.string().min(1, "Nama varian wajib diisi"),
  price_modifier: z
    .number({ error: "Harga harus berupa angka" })
    .min(0, "Harga tidak boleh negatif"),
});

export const modifierSchema = z.object({
  name: z.string().min(1, "Nama modifier wajib diisi"),
  price_modifier: z
    .number({ error: "Harga harus berupa angka" })
    .min(0, "Harga tidak boleh negatif"),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Nama item wajib diisi"),
  description: z.string().optional(),
  base_price: z
    .number({ error: "Harga harus berupa angka" })
    .min(0, "Harga tidak boleh negatif"),
  image_url: z.string().nullable().optional(),
  show_on_menu: z.boolean(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  menu_id: z.string().min(1, "Pilih menu terlebih dahulu"),
  category_id: z.string().min(1, "Pilih kategori terlebih dahulu"),
  variants: z.array(variantSchema),
  modifiers: z.array(modifierSchema),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
