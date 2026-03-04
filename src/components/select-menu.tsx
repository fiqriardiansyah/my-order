import { useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface SelectMenuOption {
  value: string;
  label: string;
  /** Small right-aligned hint text, e.g. "Default" */
  meta?: string;
}

interface BaseProps {
  options: SelectMenuOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
  footerAction?: { label: string; onClick: () => void };
  className?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | null;
  onValueChange: (value: string) => void;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onValueChange: (value: string[]) => void;
}

export type SelectMenuProps = SingleProps | MultiProps;

export function SelectMenu(props: SelectMenuProps) {
  const {
    options,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    icon,
    footerAction,
    className,
  } = props;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isMulti = props.multiple === true;

  const filtered = search.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : options;

  function isSelected(optionValue: string) {
    if (isMulti) return props.value.includes(optionValue);
    return props.value === optionValue;
  }

  function handleSelect(optionValue: string) {
    if (isMulti) {
      const next = props.value.includes(optionValue)
        ? props.value.filter((v) => v !== optionValue)
        : [...props.value, optionValue];
      props.onValueChange(next);
    } else {
      props.onValueChange(optionValue);
      setOpen(false);
      setSearch("");
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    if (isMulti) props.onValueChange([]);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSearch("");
  }

  // Trigger label
  let triggerLabel: string;
  if (isMulti) {
    if (props.value.length === 0) {
      triggerLabel = placeholder;
    } else if (props.value.length === 1) {
      triggerLabel =
        options.find((o) => o.value === props.value[0])?.label ?? placeholder;
    } else {
      triggerLabel = `${props.value.length} dipilih`;
    }
  } else {
    triggerLabel = options.find((o) => o.value === props.value)?.label ?? placeholder;
  }

  const hasSelection = isMulti ? props.value.length > 0 : false;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn("min-w-36 justify-between", className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {icon}
            <span className={cn("truncate", hasSelection && "text-foreground font-medium")}>
              {triggerLabel}
            </span>
            {hasSelection && isMulti && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                className="text-muted-foreground hover:text-foreground ml-0.5 shrink-0 rounded-sm transition-colors"
                aria-label="Clear selection"
              >
                <X className="size-3" />
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "ml-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-56 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Options list */}
        <div className="max-h-52 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-xs">
              No results found.
            </p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isSelected(option.value) && "bg-accent/50",
                )}
              >
                <span className="flex items-center gap-2">
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      isSelected(option.value)
                        ? "text-primary opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </span>
                {option.meta && (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {option.meta}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer action */}
        {footerAction && (
          <>
            <Separator />
            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  footerAction.onClick();
                  setOpen(false);
                }}
                className="text-muted-foreground flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="size-4 shrink-0" />
                {footerAction.label}
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
