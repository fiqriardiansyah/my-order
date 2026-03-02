import { Plus, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TablesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tables & QR</h1>
          <p className="text-sm text-muted-foreground">
            Manage your floor plan, tables, and QR codes.
          </p>
        </div>
        <Button size="sm">
          <Plus className="size-4" />
          Add Table
        </Button>
      </div>

      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <QrCode className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Tables & QR management coming soon</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Edit tables, zones, regenerate QR codes, and print them from here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
