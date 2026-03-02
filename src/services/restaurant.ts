import * as supabase from "./supabase/restaurant.service";
import * as api from "./api/restaurant.service";

// Set VITE_SERVICE in your .env to switch providers:
//   VITE_SERVICE=supabase  (default)
//   VITE_SERVICE=api       (future NestJS backend)
const SERVICE = import.meta.env.VITE_SERVICE ?? "supabase";

export const { createRestaurant, updateRestaurant, getUniqueSlug } =
  SERVICE === "api" ? api : supabase;
