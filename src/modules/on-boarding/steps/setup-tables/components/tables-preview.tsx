import { cn } from "@/lib/utils";
import type { GeneratedTable } from "../utils";

const VISIBLE_COUNT = 5;

interface TablesPreviewProps {
  tables: GeneratedTable[];
  className?: string;
}

export function TablesPreview({ tables, className }: TablesPreviewProps) {
  const visible = tables.slice(0, VISIBLE_COUNT);
  const remaining = tables.length - VISIBLE_COUNT;

  if (tables.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Preview
      </p>
      <div className="flex flex-wrap gap-2">
        {visible.map((table) => (
          <div
            key={table.slug}
            className="flex flex-col items-center gap-0.5 rounded-md border border-border bg-background px-3 py-2 text-center min-w-[64px]"
          >
            <span className="text-xs font-semibold text-foreground leading-tight">
              {table.name}
            </span>
            {table.zone && (
              <span className="text-[10px] text-muted-foreground leading-tight">
                {table.zone}
              </span>
            )}
          </div>
        ))}

        {remaining > 0 && (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-center min-w-[64px]">
            <span className="text-xs font-medium text-muted-foreground">
              +{remaining} more
            </span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground italic">
        QR codes will be generated automatically
      </p>
    </div>
  );
}
