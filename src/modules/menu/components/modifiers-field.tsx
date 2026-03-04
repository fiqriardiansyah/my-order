import { useFieldArray } from "react-hook-form";
import type { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { CircleHelp, GripVertical, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MenuItemFormValues } from "../schemas/menu-item.schema";

interface Props {
  control: Control<MenuItemFormValues>;
  register: UseFormRegister<MenuItemFormValues>;
  errors: FieldErrors<MenuItemFormValues>;
}

export function ModifiersField({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "modifiers",
  });

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide">
            Modifiers / Toppings
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Tentang Modifiers"
              >
                <CircleHelp className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm" side="top">
              <p className="font-semibold">Modifiers / Toppings</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Tambahan opsional yang bisa dipilih pelanggan, misalnya extra
                keju, extra shot, atau saus tambahan. Setiap modifier memiliki
                harga tersendiri.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary h-auto px-2 py-1 text-xs"
          onClick={() => append({ name: "", price_modifier: 0 })}
        >
          <Plus className="mr-1 size-3" />
          Add Modifier
        </Button>
      </div>

      <div className="space-y-2">
        {fields.length === 0 ? (
          <p className="text-muted-foreground py-2 text-sm">
            Belum ada modifier.
          </p>
        ) : (
          fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground size-4 shrink-0 cursor-grab" />
              <Input
                placeholder="Nama modifier"
                className="flex-1"
                aria-invalid={!!errors.modifiers?.[idx]?.name}
                {...register(`modifiers.${idx}.name`)}
              />
              <div className="relative w-28">
                <span className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 text-xs select-none">
                  +Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  placeholder="0"
                  className="pl-10"
                  {...register(`modifiers.${idx}.price_modifier`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-7 shrink-0"
                onClick={() => remove(idx)}
                aria-label="Hapus modifier"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
