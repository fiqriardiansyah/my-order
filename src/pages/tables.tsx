import { useState } from "react";
import QRCode from "react-qr-code";
import {
  Armchair,
  ClipboardList,
  Eye,
  Plus,
  QrCode,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";
import { SESSION_STATUS_CONFIG } from "@/modules/tables/constants";
import { buildQrUrl, timeAgo } from "@/modules/tables/utils";
import { TableFormDialog } from "@/modules/tables/components/table-form-dialog";
import { TableQRDialog } from "@/modules/tables/components/table-qr-dialog";
import { TableOrderDrawer } from "@/modules/tables/components/table-order-drawer";
import type { TableStatusFilter, TableWithQR } from "@/@types/tables";
import {
  useDeleteTable,
  useGenerateQR,
  useTableZones,
  useTablesWithQR,
} from "@/hooks/api/use-tables";

// ─── TableCard ────────────────────────────────────────────────────────────────

function TableCard({
  table,
  restaurantSlug,
  restaurantId,
  onView,
  onViewOrders,
  onDelete,
}: {
  table: TableWithQR;
  restaurantSlug: string;
  restaurantId: string;
  onView: () => void;
  onViewOrders: () => void;
  onDelete: () => void;
}) {
  const generateQR = useGenerateQR();
  const qrUrl = table.qr
    ? buildQrUrl(restaurantSlug, table.slug, table.qr.token)
    : null;

  const statusKey = !table.is_active
    ? "off"
    : (table.session_status ?? "free");
  const { label: statusLabel, dot: statusDot } =
    SESSION_STATUS_CONFIG[statusKey as keyof typeof SESSION_STATUS_CONFIG] ??
    SESSION_STATUS_CONFIG.free;

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        !table.is_active && "opacity-60",
      )}
    >
      {/* top: QR thumbnail + info */}
      <div className="flex gap-3 p-3">
        {/* QR thumbnail */}
        <div className="flex size-17 shrink-0 items-center justify-center rounded-lg border bg-white p-1.5">
          {qrUrl ? (
            <QRCode value={qrUrl} size={52} />
          ) : (
            <QrCode className="text-muted-foreground/30 size-8" />
          )}
        </div>

        {/* info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p className="truncate text-sm font-semibold">{table.name}</p>
            <div className="flex shrink-0 items-center gap-1">
              <span className={cn("size-2 rounded-full", statusDot)} />
              <span className="text-[10px] font-semibold leading-none">
                {statusLabel}
              </span>
            </div>
          </div>

          {table.zone && (
            <Badge
              variant="outline"
              className="mt-0.5 h-4 border-transparent bg-muted px-1.5 text-[10px] text-muted-foreground"
            >
              {table.zone.name}
            </Badge>
          )}

          {/* stats row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
            {table.capacity != null && (
              <span className="flex items-center gap-0.5">
                <Armchair className="size-3" />
                {table.capacity}
              </span>
            )}
            {table.guest_count != null && (
              <span className="flex items-center gap-0.5">
                <Users className="size-3" />
                {table.guest_count}
              </span>
            )}
            {table.session_opened_at && table.session_status === "open" && (
              <span className="ml-auto text-[10px]">
                {timeAgo(table.session_opened_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* generate QR button if missing */}
      {!qrUrl && (
        <div className="px-3 pb-2">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-full gap-1 text-xs"
            disabled={generateQR.isPending}
            onClick={() => generateQR.mutate({ tableId: table.id, restaurantId })}
          >
            <QrCode className="size-3" />
            {generateQR.isPending ? "Generating…" : "Generate QR"}
          </Button>
        </div>
      )}

      {/* actions */}
      <div className="mt-auto flex items-center justify-around border-t px-1 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-primary"
          aria-label="View QR"
          onClick={onView}
        >
          <Eye className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-primary"
          aria-label="View Orders"
          disabled={!table.session_id}
          onClick={onViewOrders}
        >
          <ClipboardList className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive size-7"
          aria-label="Delete"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TablesPage() {
  const { data: onboarding } = useOnboardingStatus();
  const restaurantId = onboarding?.restaurantId;
  const restaurantSlug = onboarding?.restaurantSlug ?? "";

  const { data: tables = [], isLoading } = useTablesWithQR(restaurantId);
  const { data: zones = [] } = useTableZones(restaurantId);
  const deleteMutation = useDeleteTable();

  // filters
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<TableStatusFilter>("all");

  // dialogs / drawers
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    table?: TableWithQR;
  }>({ open: false });
  const [viewTarget, setViewTarget] = useState<TableWithQR | null>(null);
  const liveViewTarget = viewTarget
    ? (tables.find((t) => t.id === viewTarget.id) ?? viewTarget)
    : null;
  const [orderTarget, setOrderTarget] = useState<TableWithQR | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TableWithQR | null>(null);
  const [deleteBlockedTarget, setDeleteBlockedTarget] = useState<TableWithQR | null>(null);

  const filtered = tables.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchZone = zoneFilter === "all" || t.zone_id === zoneFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "inactive" && !t.is_active) ||
      (statusFilter === "free" && t.is_active && !t.session_status) ||
      (statusFilter === "occupied" && t.session_status === "open") ||
      (statusFilter === "bill" && t.session_status === "bill_requested") ||
      (statusFilter === "moved" && t.session_status === "moved");
    return matchSearch && matchZone && matchStatus;
  });

  function handleDelete(table: TableWithQR) {
    if (table.session_status) {
      setDeleteBlockedTarget(table);
    } else {
      setDeleteTarget(table);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      {/* heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Tables &amp; QR</h1>
          <p className="text-muted-foreground text-sm">
            Manage your tables, zones, and QR codes.
          </p>
        </div>
        <Button onClick={() => setFormDialog({ open: true })}>
          <Plus className="size-4" />
          Add New Table
        </Button>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tables..."
            className="pl-9"
          />
        </div>

        {/* zone tabs */}
        <Tabs value={zoneFilter} onValueChange={setZoneFilter}>
          <TabsList>
            <TabsTrigger value="all">All Zones</TabsTrigger>
            {zones.map((z) => (
              <TabsTrigger key={z.id} value={z.id}>
                {z.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TableStatusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="bill">Bill Requested</SelectItem>
            <SelectItem value="moved">Moved</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted h-64 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
          {tables.length === 0
            ? "No tables yet. Click \"Add New Table\" to get started."
            : "No tables match the current filters."}
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {filtered.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              restaurantSlug={restaurantSlug}
              restaurantId={restaurantId!}
              onView={() => setViewTarget(table)}
              onViewOrders={() => setOrderTarget(table)}
              onDelete={() => handleDelete(table)}
            />
          ))}
        </div>
      )}

      {/* add / edit dialog */}
      {restaurantId && (
        <TableFormDialog
          open={formDialog.open}
          onClose={() => setFormDialog({ open: false })}
          restaurantId={restaurantId}
          zones={zones}
          table={formDialog.table}
        />
      )}

      {/* QR view dialog */}
      {liveViewTarget && restaurantId && (
        <TableQRDialog
          open={!!liveViewTarget}
          onClose={() => setViewTarget(null)}
          table={liveViewTarget}
          restaurantSlug={restaurantSlug}
          restaurantId={restaurantId}
          qrUrl={
            liveViewTarget.qr
              ? buildQrUrl(restaurantSlug, liveViewTarget.slug, liveViewTarget.qr.token)
              : null
          }
        />
      )}

      {/* order drawer */}
      {orderTarget && (
        <TableOrderDrawer
          open={!!orderTarget}
          onClose={() => setOrderTarget(null)}
          table={orderTarget}
        />
      )}

      {/* delete blocked – table has active session */}
      <Dialog
        open={!!deleteBlockedTarget}
        onOpenChange={(o) => !o && setDeleteBlockedTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cannot Delete Table</DialogTitle>
            <DialogDescription>
              <strong>{deleteBlockedTarget?.name}</strong> has an active session.
              Close the session before deleting this table.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteBlockedTarget(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete table?</DialogTitle>
            <DialogDescription>
              <strong>{deleteTarget?.name}</strong> will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
