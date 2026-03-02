import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/context";

export function useOnboardingStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["onboarding-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_members")
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
        .eq("user_id", user!.id)
        .eq("role", "owner")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const restaurant = data?.restaurants as
        | { name: string; slug: string; logo_url: string | null }
        | null
        | undefined;

      return {
        isComplete: !!restaurant?.name && restaurant.slug !== user?.id,
        restaurantId: data?.restaurant_id ?? null,
        restaurantName: restaurant?.name ?? null,
        restaurantSlug: restaurant?.slug ?? null,
        restaurantLogo: restaurant?.logo_url ?? null,
      };
    },
    enabled: !!user,
    retry: 0,
  });
}
