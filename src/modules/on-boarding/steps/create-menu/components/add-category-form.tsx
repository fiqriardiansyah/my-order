import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPicker } from "./icon-picker";
import type { MenuCategoryFormValues } from "../../../schemas/create-menu.schema";

interface AddCategoryFormProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onAdd: (category: Pick<MenuCategoryFormValues, "name" | "icon">) => void;
}

export function AddCategoryForm({ inputRef, onAdd }: AddCategoryFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍽️");
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, icon });
    setName("");
    setIcon("🍽️");
    ref.current?.focus();
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Add another category</p>
      <div className="flex gap-2">
        <Input
          ref={ref}
          placeholder="e.g. Beverages, Desserts"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1"
        />
        <IconPicker value={icon} onChange={setIcon} />
        <Button type="button" onClick={handleAdd} disabled={!name.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
