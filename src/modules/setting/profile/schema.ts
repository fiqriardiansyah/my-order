import { z } from "zod";

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(255, "Max 255 characters"),
  avatar_url: z.string().nullable().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
