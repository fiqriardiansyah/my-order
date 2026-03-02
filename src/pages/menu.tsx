import { Plus, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menu Manager</h1>
          <p className="text-sm text-muted-foreground">
            Manage your categories, items, and pricing.
          </p>
        </div>
        <Button size="sm">
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <UtensilsCrossed className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Menu manager coming soon</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Full menu editing, categories, modifiers, and availability controls
            will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
