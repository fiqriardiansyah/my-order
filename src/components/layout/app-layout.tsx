import { Navigate, Outlet } from "react-router-dom";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { OnboardingProvider, useOnboarding } from "@/modules/on-boarding/context";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";
import OnBoardingPage from "@/pages/on-boarding";

export function AppContent() {
  const { data, isLoading } = useOnboardingStatus();
  const { currentStep } = useOnboarding();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  // Keep showing the onboarding page while the user is on step 3 (QR codes),
  // even if isComplete flips to true from a background refetch after the save.
  if (!data?.isComplete || currentStep === 3) {
    return <OnBoardingPage />;
  }

  return <Navigate to="/dashboard" replace />;
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
