import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryChipProps {
  icon: string;
  name: string;
  onRemove: () => void;
}

export function CategoryChip({ icon, name, onRemove }: CategoryChipProps) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 py-1 px-2.5 text-sm font-normal"
    >
      <span>{icon}</span>
      <span>{name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="ml-0.5 rounded-full hover:text-destructive transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
