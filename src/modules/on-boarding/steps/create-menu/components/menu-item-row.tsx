import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { CreateMenuFormValues } from "../../../schemas/create-menu.schema";

interface MenuItemRowProps {
  control: Control<CreateMenuFormValues>;
  categoryIndex: number;
  itemIndex: number;
  onRemove: () => void;
}

export function MenuItemRow({
  control,
  categoryIndex,
  itemIndex,
  onRemove,
}: MenuItemRowProps) {
  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <Controller
        control={control}
        name={`categories.${categoryIndex}.items.${itemIndex}.name`}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            placeholder="Item name"
            className="flex-1"
            aria-invalid={!!fieldState.error}
          />
        )}
      />
      <Controller
        control={control}
        name={`categories.${categoryIndex}.items.${itemIndex}.base_price`}
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            min={0}
            step={500}
            placeholder="0"
            className="w-28 text-right"
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />
      <Controller
        control={control}
        name={`categories.${categoryIndex}.items.${itemIndex}.is_available`}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            aria-label="Available"
          />
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="opacity-50 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        aria-label="Remove item"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
