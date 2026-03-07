import { Armchair, Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TableOrder, TableWithQR } from "@/@types/tables";
import { useTableOrders } from "@/hooks/api/use-tables";
import { ORDER_STATUS_CONFIG } from "@/modules/tables/constants";
import { formatCurrency, timeAgo } from "@/modules/tables/utils";


function OrderCard({ order }: { order: TableOrder }) {
  const statusCfg = ORDER_STATUS_CONFIG[order.status] ?? {
    label: order.status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{order.order_number}</span>
        <div className="flex items-center gap-2">
          <Badge className={cn("text-[10px] px-1.5 h-5 border-0", statusCfg.className)}>
            {statusCfg.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {timeAgo(order.created_at)}
          </span>
        </div>
      </div>

      <ul className="space-y-1">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {item.quantity}× {item.item_name}
            </span>
            <span>{formatCurrency(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      {order.customer_note && (
        <p className="text-[11px] text-muted-foreground italic border-t pt-1.5">
          "{order.customer_note}"
        </p>
      )}

      <div className="flex items-center justify-between border-t pt-1.5 text-xs font-semibold">
        <span>Total</span>
        <span>{formatCurrency(order.total_amount)}</span>
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  table: TableWithQR;
};

export function TableOrderDrawer({ open, onClose, table }: Props) {
  const { data: orders = [], isLoading } = useTableOrders(open ? table.session_id : null);

  const sessionTotal = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="p-4 pb-3">
          <SheetTitle>Orders – {table.name}</SheetTitle>
        </SheetHeader>

        {/* Brief table info */}
        <div className="px-4 pb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {table.zone && (
            <Badge
              variant="outline"
              className="h-5 border-transparent bg-muted px-1.5 text-[11px] text-muted-foreground"
            >
              {table.zone.name}
            </Badge>
          )}
          {table.capacity != null && (
            <span className="flex items-center gap-1 text-xs">
              <Armchair className="size-3" />
              {table.capacity} seats
            </span>
          )}
          {table.guest_count != null && (
            <span className="flex items-center gap-1 text-xs">
              <Users className="size-3" />
              {table.guest_count} guests
            </span>
          )}
          {table.session_opened_at && (
            <span className="flex items-center gap-1 text-xs">
              <Clock className="size-3" />
              Opened {timeAgo(table.session_opened_at)}
            </span>
          )}
        </div>

        <Separator />

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </>
          ) : orders.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No orders yet for this session.
            </div>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>

        {/* Session total */}
        {orders.length > 0 && (
          <>
            <Separator />
            <div className="p-4 flex items-center justify-between text-sm font-semibold">
              <span>Session Total ({orders.length} orders)</span>
              <span>{formatCurrency(sessionTotal)}</span>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
