import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ZoneManagerProps {
  zones: string[];
  onChange: (zones: string[]) => void;
}

const DEFAULT_SUGGESTIONS = ["Indoor", "Outdoor", "VIP", "Bar", "Rooftop"];

export function ZoneManager({ zones, onChange }: ZoneManagerProps) {
  const [open, setOpen] = useState(zones.length > 0);
  const [inputValue, setInputValue] = useState("");
  const [inputVisible, setInputVisible] = useState(false);

  const addZone = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || zones.includes(trimmed)) return;
    onChange([...zones, trimmed]);
    setInputValue("");
    setInputVisible(false);
  };

  const removeZone = (zone: string) => {
    onChange(zones.filter((z) => z !== zone));
  };

  const suggestions = DEFAULT_SUGGESTIONS.filter((s) => !zones.includes(s));

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
          "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          open ? "bg-accent/20" : "bg-background"
        )}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-foreground">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          Group by area?
          <span className="text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Customers will see which area they're in
          </p>

          {/* Zone tags */}
          <div className="flex flex-wrap gap-1.5">
            {zones.map((zone) => (
              <Badge
                key={zone}
                variant="secondary"
                className="gap-1 pr-1 pl-2 py-0.5 text-xs"
              >
                {zone}
                <button
                  type="button"
                  onClick={() => removeZone(zone)}
                  className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label={`Remove ${zone} zone`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {/* Add zone trigger */}
            {!inputVisible && (
              <button
                type="button"
                onClick={() => setInputVisible(true)}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-3 w-3" />
                Add zone
              </button>
            )}
          </div>

          {/* Inline add input */}
          {inputVisible && (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addZone(inputValue);
                  }
                  if (e.key === "Escape") {
                    setInputVisible(false);
                    setInputValue("");
                  }
                }}
                placeholder="e.g. Indoor"
                className="h-7 text-sm"
                maxLength={50}
              />
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs px-3"
                onClick={() => addZone(inputValue)}
                disabled={!inputValue.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2"
                onClick={() => {
                  setInputVisible(false);
                  setInputValue("");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Quick-pick suggestions */}
          {suggestions.length > 0 && !inputVisible && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addZone(s)}
                  className="rounded-md border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
