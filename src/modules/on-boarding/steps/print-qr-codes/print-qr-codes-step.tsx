import QRCode from "react-qr-code";
import { CheckCircle2, Download, FileImage, Printer } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StepProgressHeader } from "@/components/step-progress-header";
import { useOnboardingStatus } from "../../hooks/use-onboarding-status";
import { useRestaurantQrData } from "../../queries/use-restaurant-qr-data";
import type { RestaurantTable } from "../../queries/use-restaurant-qr-data";

const VISIBLE_QR_COUNT = 4;

interface PrintQRCodesStepProps {
  onDone?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export function PrintQRCodesStep({
  onDone,
  currentStep = 4,
  totalSteps = 4,
}: PrintQRCodesStepProps) {
  const showAll = false;
  const { data: status } = useOnboardingStatus();
  const { data, isLoading } = useRestaurantQrData(status?.restaurantId);

  const baseUrl = window.location.origin;
  const restaurantSlug = status?.restaurantSlug ?? "";
  const restaurantName = status?.restaurantName ?? "";
  const restaurantLogo = status?.restaurantLogo ?? undefined;
  const tables = data?.tables ?? [];
  const visibleTables = showAll ? tables : tables.slice(0, VISIBLE_QR_COUNT);
  const remaining = tables.length - VISIBLE_QR_COUNT;

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-6">
      <StepProgressHeader currentStep={currentStep} totalSteps={totalSteps} />

      {/* Header */}
      <div className="space-y-2">
        <Badge className="w-fit gap-1.5 border-green-200 bg-green-100 text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          You&apos;re all set!
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">
          Your QR codes are ready!
        </h1>
        <p className="text-sm text-muted-foreground">
          Print and place them on your tables. Customers scan to browse and
          order.
        </p>
      </div>

      <Separator />

      {/* QR Code Grid */}
      {isLoading ? (
        <QRGridSkeleton />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {visibleTables.map((table) => (
              <QRCard
                key={table.id}
                table={table}
                url={`${baseUrl}/${restaurantSlug}/${table.slug}`}
                restaurantName={restaurantName}
                restaurantLogo={restaurantLogo}
              />
            ))}
          </div>

          {!showAll && remaining > 0 && (
            <button className="text-sm font-medium text-primary hover:underline">
              and {remaining} more tables...
            </button>
          )}
        </div>
      )}

      {/* Save / Print actions */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Save or print your QR codes</p>
        <div className="space-y-2">
          <ActionRow
            icon={<Printer className="h-4 w-4" />}
            title="Print All Tables"
            subtitle="Opens print preview — A4 or thermal"
            buttonLabel="Print"
            primary
          />
          <ActionRow
            icon={<Download className="h-4 w-4" />}
            title="Download PDF"
            subtitle="All QR codes in one file"
            buttonLabel="Download"
          />
          <ActionRow
            icon={<FileImage className="h-4 w-4" />}
            title="Export as PNG"
            subtitle="Individual files per table"
            buttonLabel="Export"
          />
        </div>
      </div>

      {/* Restaurant live stats */}
      {isLoading ? (
        <Skeleton className="h-44 rounded-xl" />
      ) : (
        <div className="space-y-4 rounded-xl bg-foreground p-5 text-background">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-sm font-semibold">Your restaurant is live</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatItem value={data?.tablesCount ?? 0} label="Tables" />
            <StatItem
              value={data?.categoriesCount ?? 0}
              label="Categories"
              dot
            />
            <StatItem value={data?.itemsCount ?? 0} label="Menu Items" />
            <StatItem
              value={data?.activeMenusCount ?? 0}
              label="Menu active"
              dot
            />
          </div>

          <Separator className="bg-background/10" />

          <div className="space-y-1.5">
            <p className="text-xs text-background/50">
              Go to your staff dashboard to start taking orders
            </p>
            <span className="text-sm font-medium text-primary">
              View live menu →
            </span>
          </div>
        </div>
      )}

      {/* Go to Dashboard */}
      <Button size="lg" className="w-full" onClick={onDone}>
        Go to Dashboard →
      </Button>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface QRCardProps {
  table: RestaurantTable;
  url: string;
  restaurantName: string;
  restaurantLogo?: string;
}

function QRCard({ table, url, restaurantName, restaurantLogo }: QRCardProps) {
  const initials = restaurantName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center">
      <Avatar className="h-7 w-7">
        <AvatarImage src={restaurantLogo} alt={restaurantName} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>

      <div className="rounded-lg bg-white p-1.5">
        <QRCode value={url} size={96} />
      </div>

      <p className="text-xs font-semibold leading-tight">{table.name}</p>
      <p className="text-[11px] italic text-primary">Scan to Order</p>
    </div>
  );
}

interface ActionRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  buttonLabel: string;
  primary?: boolean;
}

function ActionRow({
  icon,
  title,
  subtitle,
  buttonLabel,
  primary,
}: ActionRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Button
        variant={primary ? "default" : "outline"}
        size="sm"
        disabled
        className="shrink-0"
      >
        {buttonLabel} →
      </Button>
    </div>
  );
}

interface StatItemProps {
  value: number;
  label: string;
  dot?: boolean;
}

function StatItem({ value, label, dot }: StatItemProps) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <div className="flex items-center gap-1">
        {dot && (
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
        )}
        <p className="text-xs text-background/50">{label}</p>
      </div>
    </div>
  );
}

function QRGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}
