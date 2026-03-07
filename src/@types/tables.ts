export interface TableZone {
  id: string;
  name: string;
  sort_order: number;
}

export type TableSessionStatus = "open" | "bill_requested" | "moved" | "merged";

export interface TableWithQR {
  id: string;
  name: string;
  slug: string;
  capacity: number | null;
  is_active: boolean;
  sort_order: number;
  zone_id: string | null;
  zone: TableZone | null;
  qr: { id: string; token: string } | null;
  session_id: string | null;
  session_status: TableSessionStatus | null;
  guest_count: number | null;
  session_opened_at: string | null;
}

export interface TableOrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface TableOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  total_amount: number;
  customer_note: string | null;
  created_at: string;
  order_items: TableOrderItem[];
}

export type TableStatusFilter = "all" | "free" | "occupied" | "bill" | "moved" | "inactive";

export interface TableFormValues {
  name: string;
  slug: string;
  zone_id: string | null;
  capacity: number | null;
  is_active: boolean;
}
