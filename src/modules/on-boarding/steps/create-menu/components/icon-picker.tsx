import { memo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATEGORY_ICONS } from "../constants";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export const IconPicker = memo(function IconPicker({
  value,
  onChange,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (icon: string) => {
      onChange(icon);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-16 flex-col gap-0 text-base leading-tight"
        >
          <span>{value || "🍽️"}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Icon
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="start">
        <div className="grid grid-cols-8 gap-0.5">
          {CATEGORY_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              className={cn(
                "h-8 w-8 rounded text-lg flex items-center justify-center hover:bg-accent transition-colors",
                value === icon && "bg-accent ring-1 ring-ring",
              )}
              onClick={() => handleSelect(icon)}
            >
              {icon}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});
