import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useOnboarding } from "@/modules/on-boarding/context";
import { CreateMenuStep } from "@/modules/on-boarding/steps/create-menu";
import { RestaurantProfileStep } from "@/modules/on-boarding/steps/restaurant-profile";
import { SetupTablesStep } from "@/modules/on-boarding/steps/setup-tables";
import { useSaveOnboarding } from "@/modules/on-boarding/queries/use-save-onboarding";

export default function OnBoardingPage() {
  const queryClient = useQueryClient();
  const {
    currentStep,
    goToStep,
    restaurantProfile,
    setRestaurantProfile,
    createMenu,
    setCreateMenu,
    setupTables,
    setSetupTables,
  } = useOnboarding();

  const saveOnboardingMutation = useSaveOnboarding();

  return (
    <div className="flex min-h-svh items-start justify-center overflow-y-auto py-8">
      {currentStep === 0 && (
        <RestaurantProfileStep
          defaultValues={restaurantProfile ?? undefined}
          onNext={(data) => {
            setRestaurantProfile(data);
            goToStep(1);
          }}
        />
      )}
      {currentStep === 1 && (
        <CreateMenuStep
          defaultValues={createMenu ?? undefined}
          onNext={(data) => {
            setCreateMenu(data);
            goToStep(2);
          }}
          onBack={() => goToStep(0)}
        />
      )}
      {currentStep === 2 && (
        <SetupTablesStep
          defaultValues={setupTables ?? undefined}
          isLoading={saveOnboardingMutation.isPending}
          onNext={(data) => {
            setSetupTables(data);
            saveOnboardingMutation.mutate(
              {
                restaurantProfile: restaurantProfile!,
                menu: createMenu!,
                tables: data,
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["onboarding-status"],
                  });
                },
                onError: (err) =>
                  toast.error("Failed to save onboarding data", {
                    description: err.message,
                  }),
              }
            );
          }}
          onBack={() => goToStep(1)}
        />
      )}
    </div>
  );
}
