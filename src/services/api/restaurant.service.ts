import type {
  RestaurantInput,
  RestaurantRecord,
} from "../interfaces/restaurant.interface";

// Stub — implement these when the NestJS API is ready.
// Each function should call the corresponding REST endpoint instead.

export async function createRestaurant(
  _input: RestaurantInput
): Promise<RestaurantRecord> {
  throw new Error("API restaurant service: not implemented");
}

export async function updateRestaurant(
  _id: string,
  _input: RestaurantInput
): Promise<void> {
  throw new Error("API restaurant service: not implemented");
}

export async function getUniqueSlug(_baseSlug: string): Promise<string> {
  throw new Error("API restaurant service: not implemented");
}
