import { ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage live and past orders.
        </p>
      </div>

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <ClipboardList className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Order management coming soon</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Real-time order queue, status updates, and order history will
            appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
