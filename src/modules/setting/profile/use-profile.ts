import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/context";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          full_name,
          avatar_url,
          last_login_at,
          created_at,
          restaurant_members (role)
        `)
        .eq("id", user!.id)
        .single();

      if (error) throw error;

      const role = (data.restaurant_members as { role: string }[] | null)?.[0]?.role ?? null;
      return { ...data, role };
    },
    enabled: !!user,
  });
}
