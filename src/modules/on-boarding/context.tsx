/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { RestaurantProfileFormValues } from "./schemas/restaurant-profile.schema";
import type { CreateMenuFormValues } from "./schemas/create-menu.schema";
import type { SetupTablesFormValues } from "./schemas/setup-tables.schema";

interface OnboardingContextValue {
  currentStep: number;
  goToStep: (step: number) => void;
  restaurantProfile: RestaurantProfileFormValues | null;
  createMenu: CreateMenuFormValues | null;
  setupTables: SetupTablesFormValues | null;
  setRestaurantProfile: (data: RestaurantProfileFormValues) => void;
  setCreateMenu: (data: CreateMenuFormValues) => void;
  setSetupTables: (data: SetupTablesFormValues) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [restaurantProfile, setRestaurantProfile] =
    useState<RestaurantProfileFormValues | null>(null);
  const [createMenu, setCreateMenu] = useState<CreateMenuFormValues | null>(
    null,
  );
  const [setupTables, setSetupTables] = useState<SetupTablesFormValues | null>(
    null,
  );

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        goToStep: setCurrentStep,
        restaurantProfile,
        createMenu,
        setupTables,
        setRestaurantProfile,
        setCreateMenu,
        setSetupTables,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
