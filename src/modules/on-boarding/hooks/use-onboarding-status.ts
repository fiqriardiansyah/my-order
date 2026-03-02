import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/context";

export function useOnboardingStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["onboarding-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `
          restaurant_id,
          restaurants (
            name,
            slug,
            logo_url
          )
        `,
        )
        .eq("id", user!.id)
        .single();

      if (error) throw error;

      const restaurant = data?.restaurants;

      return {
        isComplete: !!restaurant?.name && restaurant.slug !== user?.id,
        restaurantId: data?.restaurant_id,
        restaurantName: restaurant?.name ?? null,
        restaurantLogo: restaurant?.logo_url ?? null,
      };
    },
    enabled: !!user,
    retry: 0,
  });
}
