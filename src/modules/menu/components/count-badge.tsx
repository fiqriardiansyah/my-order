import { Badge } from "@/components/ui/badge";

export function CountBadge({
  count,
  label,
  colorClass,
}: {
  count: number;
  label: string;
  colorClass: string;
}) {
  if (count === 0) return <span className="text-muted-foreground">–</span>;
  return (
    <Badge className={colorClass}>
      {count} {label}
    </Badge>
  );
}
