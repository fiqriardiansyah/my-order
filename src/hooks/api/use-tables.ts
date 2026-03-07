import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TableFormValues, TableOrder, TableWithQR, TableZone } from "@/@types/tables";

// ─── zones ────────────────────────────────────────────────────────────────────

export function useTableZones(restaurantId: string | null | undefined) {
  return useQuery<TableZone[]>({
    queryKey: ["table-zones", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table_zones")
        .select("id, name, sort_order")
        .eq("restaurant_id", restaurantId!)
        .order("sort_order");
      if (error) throw error;
      return data as TableZone[];
    },
  });
}

// ─── tables with QR ───────────────────────────────────────────────────────────

type RawTable = {
  id: string;
  name: string;
  slug: string;
  capacity: number | null;
  is_active: boolean;
  sort_order: number;
  zone_id: string | null;
  zone: { id: string; name: string; sort_order: number } | null;
  qr: { id: string; token: string }[];
  sessions: { id: string; status: string; guest_count: number | null; opened_at: string; closed_at: string | null }[];
};

export function useTablesWithQR(restaurantId: string | null | undefined) {
  return useQuery<TableWithQR[]>({
    queryKey: ["tables", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tables")
        .select(
          `id, name, slug, capacity, is_active, sort_order, zone_id,
           zone:table_zones(id, name, sort_order),
           qr:qr_codes(id, token),
           sessions:table_sessions!table_sessions_table_id_fkey(id, status, guest_count, opened_at, closed_at)`,
        )
        .eq("restaurant_id", restaurantId!)
        .is("deleted_at", null)
        .eq("qr_codes.is_active", true)
        .order("sort_order");
      if (error) throw error;

      return ((data ?? []) as unknown as RawTable[]).map((row) => {
        const openSessions = Array.isArray(row.sessions) ? row.sessions.filter((s) => !s.closed_at) : [];
        const session = openSessions.length > 0 ? openSessions[0] : null;
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          capacity: row.capacity,
          is_active: row.is_active,
          sort_order: row.sort_order,
          zone_id: row.zone_id,
          zone: row.zone ?? null,
          qr: Array.isArray(row.qr) && row.qr.length > 0 ? row.qr[0] : null,
          session_id: session?.id ?? null,
          session_status: session ? (session.status as import("@/@types/tables").TableSessionStatus) : null,
          guest_count: session?.guest_count ?? null,
          session_opened_at: session?.opened_at ?? null,
        };
      }) as TableWithQR[];
    },
  });
}

// ─── create / update / delete ─────────────────────────────────────────────────

export function useCreateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      restaurantId,
      values,
    }: {
      restaurantId: string;
      values: TableFormValues;
    }) => {
      const { data, error } = await supabase
        .from("tables")
        .insert({
          restaurant_id: restaurantId,
          name: values.name,
          slug: values.slug,
          zone_id: values.zone_id ?? null,
          capacity: values.capacity ?? null,
          is_active: values.is_active,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      restaurantId,
      values,
    }: {
      id: string;
      restaurantId: string;
      values: TableFormValues;
    }) => {
      const { error } = await supabase
        .from("tables")
        .update({
          name: values.name,
          slug: values.slug,
          zone_id: values.zone_id ?? null,
          capacity: values.capacity ?? null,
          is_active: values.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tables")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

// ─── table orders ─────────────────────────────────────────────────────────────

export function useTableOrders(sessionId: string | null | undefined) {
  return useQuery<TableOrder[]>({
    queryKey: ["table-orders", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, order_number, status, subtotal, total_amount, customer_note, created_at,
           order_items(id, item_name, quantity, unit_price, subtotal)`,
        )
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TableOrder[];
    },
  });
}

// ─── QR generation ────────────────────────────────────────────────────────────

export function useGenerateQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tableId,
      restaurantId,
    }: {
      tableId: string;
      restaurantId: string;
    }) => {
      // deactivate existing active QR for this table
      await supabase
        .from("qr_codes")
        .update({ is_active: false })
        .eq("table_id", tableId)
        .eq("is_active", true);

      // insert new active QR
      const { data, error } = await supabase
        .from("qr_codes")
        .insert({ table_id: tableId, restaurant_id: restaurantId, is_active: true })
        .select("id, token")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}
