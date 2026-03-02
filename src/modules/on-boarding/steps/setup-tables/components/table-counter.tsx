import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_TABLES } from "../constant";

interface TableCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function TableCounter({
  value,
  onChange,
  min = 1,
  max = MAX_TABLES,
}: TableCounterProps) {
  const [raw, setRaw] = useState<string>(String(value));

  const commit = (str: string) => {
    const parsed = parseInt(str, 10);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
      setRaw(String(Math.min(max, Math.max(min, parsed))));
    } else {
      setRaw(String(value));
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shrink-0"
          onClick={() => {
            const next = Math.max(min, value - 1);
            onChange(next);
            setRaw(String(next));
          }}
          disabled={value <= min}
          aria-label="Decrease table count"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(raw);
              e.currentTarget.blur();
            }
          }}
          aria-label="Number of tables"
          className="h-14 w-20 text-center text-4xl font-bold tabular-nums px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full shrink-0"
          onClick={() => {
            const next = Math.min(max, value + 1);
            onChange(next);
            setRaw(String(next));
          }}
          disabled={value >= max}
          aria-label="Increase table count"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">tables will be created</p>
    </div>
  );
}
