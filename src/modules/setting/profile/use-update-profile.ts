import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/context";
import type { ProfileFormValues } from "./schema";

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: values.full_name,
          avatar_url: values.avatar_url ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}
