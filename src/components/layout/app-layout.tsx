import { Outlet } from "react-router-dom";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { OnboardingProvider } from "@/modules/on-boarding/context";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";
import OnBoardingPage from "@/pages/on-boarding";

export function AppContent() {
  const { data, isLoading } = useOnboardingStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!data?.isComplete) {
    return <OnBoardingPage />;
  }

  // TODO: render main app pages here once onboarding is done
  return (
    <div className="flex min-h-svh items-center justify-center text-muted-foreground">
      Dashboard coming soon
    </div>
  );
}

export function AppLayout() {
  return (
    <OnboardingProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </OnboardingProvider>
  );
}
