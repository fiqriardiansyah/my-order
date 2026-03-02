export interface RestaurantInput {
  name: string;
  slug: string;
  logo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  currency: string;
  timezone: string;
  country_code: string;
}

export interface RestaurantRecord {
  id: string;
}

export interface IRestaurantService {
  createRestaurant(input: RestaurantInput): Promise<RestaurantRecord>;
  updateRestaurant(id: string, input: RestaurantInput): Promise<void>;
}
