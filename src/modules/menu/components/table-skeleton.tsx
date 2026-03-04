import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-3.5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-9 rounded-full" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
