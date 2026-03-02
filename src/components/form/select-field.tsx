import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends React.ComponentProps<"select"> {
  options: readonly SelectOption[];
}

export function SelectField({ options, className, ...props }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "border-input h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 pr-8 text-sm shadow-xs outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
