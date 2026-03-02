import { z } from "zod";

export const restaurantProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required")
    .max(100, "Name must be 100 characters or less"),
  logo_url: z.string().url("Logo URL must be a valid URL"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be 255 characters or less"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number must be 20 characters or less"),
  country_code: z.string().default("ID"),
  currency: z.string().default("IDR"),
  timezone: z.string().default("Asia/Jakarta"),
});

export type RestaurantProfileFormValues = z.infer<
  typeof restaurantProfileSchema
>;
