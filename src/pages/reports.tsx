import { BarChart3, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Sales, revenue, and performance analytics.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <BarChart3 className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Reports coming soon</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Sales charts, top-selling items, revenue breakdowns, and CSV
            exports will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
