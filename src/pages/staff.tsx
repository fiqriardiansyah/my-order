import { UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StaffPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team members, roles, and permissions.
          </p>
        </div>
        <Button size="sm">
          <UserPlus className="size-4" />
          Invite Staff
        </Button>
      </div>

      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <Users className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Staff management coming soon</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Invite team members, assign roles, and control access to your
            restaurant account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
