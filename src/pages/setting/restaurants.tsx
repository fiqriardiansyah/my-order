import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Phone } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean;
}

function useOwnerRestaurants(userId: string | undefined) {
  return useQuery<Restaurant[]>({
    queryKey: ["owner-restaurants", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_members")
        .select("restaurant:restaurants(id, name, slug, logo_url, address, phone, is_active)")
        .eq("user_id", userId!)
        .eq("role", "owner")
        .is("deleted_at", null);

      if (error) throw error;
      return (data ?? []).map((row) => row.restaurant as Restaurant);
    },
  });
}

export default function RestaurantsPage() {
  const { user } = useAuth();
  const { data: restaurants, isLoading } = useOwnerRestaurants(user?.id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold">My Restaurants</h1>
        <p className="text-sm text-muted-foreground">Restaurants you own.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}

      {!isLoading && restaurants?.length === 0 && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
            No restaurants found.
          </CardContent>
        </Card>
      )}

      {!isLoading && restaurants && restaurants.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {restaurants.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                {r.logo_url ? (
                  <img
                    src={r.logo_url}
                    alt={r.name}
                    className="size-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                    <Building2 className="text-muted-foreground size-5" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <CardTitle className="truncate text-base">{r.name}</CardTitle>
                  <p className="text-muted-foreground text-xs">/{r.slug}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.is_active ? "Active" : "Inactive"}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {r.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{r.address}</span>
                  </div>
                )}
                {r.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{r.phone}</span>
                  </div>
                )}
                {!r.address && !r.phone && (
                  <span className="text-xs italic">No contact info</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
