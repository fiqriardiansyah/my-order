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

export function VariantsField({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide">
            Variants
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Tentang Variants"
              >
                <CircleHelp className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm" side="top">
              <p className="font-semibold">Variants</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Pilihan yang menggantikan item dasar, misalnya ukuran (S / M /
                L) atau tingkat kepedasan. Setiap varian dapat memiliki harga
                yang berbeda.
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
          Add Variant
        </Button>
      </div>

      <div className="space-y-2">
        {fields.length === 0 ? (
          <p className="text-muted-foreground py-2 text-sm">
            Belum ada varian.
          </p>
        ) : (
          fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground size-4 shrink-0 cursor-grab" />
              <Input
                placeholder="Nama varian"
                className="flex-1"
                aria-invalid={!!errors.variants?.[idx]?.name}
                {...register(`variants.${idx}.name`)}
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
                  {...register(`variants.${idx}.price_modifier`, {
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
                aria-label="Hapus varian"
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
