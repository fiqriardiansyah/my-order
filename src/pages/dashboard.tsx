import {
  BarChart3,
  ClipboardList,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATS = [
  { label: "Total Orders", value: "—", icon: ClipboardList, color: "text-green-500" },
  { label: "Revenue", value: "—", icon: TrendingUp, color: "text-blue-500" },
  { label: "Menu Items", value: "—", icon: ShoppingBag, color: "text-orange-500" },
  { label: "Reports", value: "—", icon: BarChart3, color: "text-yellow-500" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your restaurant performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          Charts and activity feed coming soon.
        </CardContent>
      </Card>
    </div>
  );
}
