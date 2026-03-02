import { z } from "zod";

export const NAMING_STYLES = ["numbered", "short", "grid"] as const;
export type NamingStyle = (typeof NAMING_STYLES)[number];

export const setupTablesSchema = z.object({
  count: z
    .number()
    .min(1, "At least 1 table required")
    .max(50, "Maximum 50 tables"),
  namingStyle: z.enum(NAMING_STYLES).default("numbered"),
  zones: z.array(z.string().min(1).max(50)).default([]),
});

export type SetupTablesFormValues = z.infer<typeof setupTablesSchema>;
