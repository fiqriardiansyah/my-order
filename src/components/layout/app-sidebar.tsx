import { Wheat } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Stepper, { type StepItem } from "@/components/stepper";
import { NavUser } from "@/components/layout/nav-user";
import { useAuth } from "@/modules/auth/context";
import { useOnboarding } from "@/modules/on-boarding/context";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";
import { useProfile } from "@/modules/setting/profile/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const ONBOARDING_STEPS: StepItem[] = [
  {
    index: 0,
    id: "restaurant-profile",
    label: "Step 1",
    title: "Restaurant Profile",
  },
  { index: 1, id: "create-menu", label: "Step 2", title: "Create Menu" },
  { index: 2, id: "setup-tables", label: "Step 3", title: "Set Up Tables" },
  { index: 3, id: "print-qr-codes", label: "Step 4", title: "Print QR Codes" },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { currentStep } = useOnboarding();
  const { data: onboardingStatus, isLoading } = useOnboardingStatus();

  const isOnboardingComplete = onboardingStatus?.isComplete ?? false;
  const restaurantName = onboardingStatus?.restaurantName;
  const restaurantLogo = onboardingStatus?.restaurantLogo;

  const { data: profile } = useProfile();

  const name: string =
    user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "User";
  const email = user?.email ?? "";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="default" className="overflow-hidden">
              {isOnboardingComplete && restaurantName ? (
                <Avatar className="size-8 shrink-0 rounded-lg">
                  <AvatarImage
                    src={restaurantLogo ?? undefined}
                    alt={restaurantName}
                  />
                  <AvatarFallback className="rounded-lg text-xs">
                    {restaurantName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Wheat className="shrink-0" />
              )}
              <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="truncate text-base font-semibold leading-tight">
                  {isOnboardingComplete && restaurantName ? restaurantName : ""}
                </span>
                {!isOnboardingComplete && (
                  <span className="truncate text-xs text-muted-foreground">
                    Let&apos;s get you set up
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 group-data-[collapsible=icon]:hidden">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : !isOnboardingComplete ? (
          <Stepper steps={ONBOARDING_STEPS} currentStep={currentStep} />
        ) : null}
        {/* App navigation goes here once onboarding is complete */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser name={name} email={email} avatarUrl={profile?.avatar_url ?? undefined} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
