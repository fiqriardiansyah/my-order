import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NamingStyle } from "../../../schemas/setup-tables.schema";

interface NamingOption {
  value: NamingStyle;
  preview: string;
  label: string;
}

const NAMING_OPTIONS: NamingOption[] = [
  { value: "numbered", preview: "Table 01", label: "Numbered" },
  { value: "short",    preview: "T-01",     label: "Short code" },
  { value: "grid",     preview: "A1",       label: "Grid style" },
];

interface NamingStylePickerProps {
  value: NamingStyle;
  onChange: (value: NamingStyle) => void;
}

export function NamingStylePicker({ value, onChange }: NamingStylePickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Naming Style
      </p>
      <div className="grid grid-cols-3 gap-2">
        {NAMING_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center transition-all",
                "hover:border-primary/60 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-foreground"
              )}
              aria-pressed={isSelected}
              aria-label={`Naming style: ${opt.label}`}
            >
              {isSelected && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
              <span className="text-sm font-semibold">{opt.preview}</span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
