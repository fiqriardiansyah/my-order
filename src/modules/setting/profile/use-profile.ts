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
        .select("full_name, avatar_url, role, last_login_at, created_at")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
