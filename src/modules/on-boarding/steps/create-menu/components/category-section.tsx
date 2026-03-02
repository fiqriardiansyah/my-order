import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import type { Control } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { MenuItemRow } from "./menu-item-row";
import type { CreateMenuFormValues } from "../../../schemas/create-menu.schema";

interface CategorySectionProps {
  control: Control<CreateMenuFormValues>;
  categoryIndex: number;
  name: string;
  icon: string;
  defaultOpen?: boolean;
}

export function CategorySection({
  control,
  categoryIndex,
  name,
  icon,
  defaultOpen = false,
}: CategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `categories.${categoryIndex}.items`,
  });

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border bg-card"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span className="font-medium text-sm">{name}</span>
            <span className="text-sm text-muted-foreground font-normal">
              — {fields.length} {fields.length === 1 ? "item" : "items"}
            </span>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Separator />
        <div className="px-4 pb-4 pt-2 space-y-0.5">
          {fields.map((item, itemIndex) => (
            <MenuItemRow
              key={item.id}
              control={control}
              categoryIndex={categoryIndex}
              itemIndex={itemIndex}
              onRemove={() => remove(itemIndex)}
            />
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-primary hover:text-primary hover:bg-primary/10"
            onClick={() =>
              append({ name: "", base_price: 0, is_available: true })
            }
          >
            <Plus className="h-4 w-4" />
            Add item to {name}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
