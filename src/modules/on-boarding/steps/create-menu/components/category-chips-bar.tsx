import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "./category-chip";
import type { MenuCategoryFormValues } from "../../../schemas/create-menu.schema";

interface CategoryChipsBarProps {
  categories: Pick<MenuCategoryFormValues, "name" | "icon">[];
  onRemove: (index: number) => void;
  onAddClick: () => void;
}

export function CategoryChipsBar({
  categories,
  onRemove,
  onAddClick,
}: CategoryChipsBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Your categories</p>
        {categories.length > 0 && (
          <span className="text-sm font-medium text-primary">
            {categories.length} added
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 min-h-8">
        {categories.map((cat, index) => (
          <CategoryChip
            key={index}
            icon={cat.icon}
            name={cat.name}
            onRemove={() => onRemove(index)}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 border-dashed text-muted-foreground"
          onClick={onAddClick}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>
    </div>
  );
}
