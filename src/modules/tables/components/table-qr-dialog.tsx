import {
  Armchair,
  Download,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";
import { useRef } from "react";
import { CopyButton } from "@/components/copy-button";

import type { TableWithQR } from "@/@types/tables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useGenerateQR } from "@/hooks/api/use-tables";
import { SESSION_STATUS_CONFIG } from "@/modules/tables/constants";
import { cn } from "@/lib/utils";
import { TableQRDisplay } from "./table-qr-display";


function downloadQRPng(svgEl: SVGSVGElement | null, filename: string) {
  if (!svgEl) return;
  const size = 512;
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, size, size);
    const a = document.createElement("a");
    a.download = `${filename}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function openPrintWindow(
  svgEl: SVGSVGElement | null,
  tableName: string,
  autoPrint: boolean,
) {
  if (!svgEl) return;
  const svgHtml = svgEl.outerHTML;
  const win = window.open("", "_blank", "width=400,height=500");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>QR – ${tableName}</title>
        <style>
          body { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; font-family:sans-serif; }
          h2 { margin-bottom: 16px; font-size: 18px; }
          svg { width: 256px; height: 256px; }
        </style>
      </head>
      <body>
        <h2>${tableName}</h2>
        ${svgHtml}
        ${autoPrint ? `<script>window.onload = () => { window.print(); window.close(); }</script>` : ""}
      </body>
    </html>
  `);
  win.document.close();
}


type Props = {
  open: boolean;
  onClose: () => void;
  table: TableWithQR;
  restaurantSlug: string;
  restaurantId: string;
  qrUrl: string | null;
};

export function TableQRDialog({
  open,
  onClose,
  table,
  restaurantId,
  qrUrl,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generateQR = useGenerateQR();

  const statusKey = !table.is_active ? "off" : (table.session_status ?? "free");
  const { label: statusLabel, dot: statusDot } =
    SESSION_STATUS_CONFIG[statusKey as keyof typeof SESSION_STATUS_CONFIG] ??
    SESSION_STATUS_CONFIG.free;

  function getSvg() {
    return containerRef.current?.querySelector("svg") ?? null;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Left – QR display */}
          <TableQRDisplay ref={containerRef} qrUrl={qrUrl} size={200} />

          {/* Right – Table info + actions */}
          <div className="flex flex-1 flex-col justify-between gap-4">
            {/* Table info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">{table.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", statusDot)} />
                  <span className="text-xs font-semibold">{statusLabel}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
                {table.zone && (
                  <Badge
                    variant="outline"
                    className="h-5 border-transparent bg-muted px-1.5 text-[11px] text-muted-foreground"
                  >
                    {table.zone.name}
                  </Badge>
                )}
                {table.capacity != null && (
                  <span className="flex items-center gap-1">
                    <Armchair className="size-3" />
                    {table.capacity} seats
                  </span>
                )}
                {table.guest_count != null && (
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {table.guest_count} guests
                  </span>
                )}
              </div>

              {qrUrl && <CopyButton text={qrUrl} label="Copy link" />}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                disabled={!qrUrl}
                onClick={() => openPrintWindow(getSvg(), table.name, true)}
              >
                <Printer className="size-3.5" />
                Print
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                disabled={!qrUrl}
                onClick={() => downloadQRPng(getSvg(), table.name)}
              >
                <Download className="size-3.5" />
                PNG
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                disabled={!qrUrl}
                onClick={() => openPrintWindow(getSvg(), table.name, false)}
              >
                <FileText className="size-3.5" />
                PDF
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="size-8 shrink-0">
                    <Settings className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={generateQR.isPending}
                    onClick={() =>
                      generateQR.mutate({ tableId: table.id, restaurantId })
                    }
                  >
                    {qrUrl ? (
                      <RefreshCw className="size-3.5 mr-2" />
                    ) : (
                      <Plus className="size-3.5 mr-2" />
                    )}
                    {qrUrl ? "Regenerate QR" : "Generate QR"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
