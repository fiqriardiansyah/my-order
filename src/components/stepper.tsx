import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  index: number;
  id: string;
  label: string;
  title: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number; // matches step.index
  className?: string;
}

const Stepper = ({ steps, currentStep, className }: StepperProps) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {steps.map((step, index) => {
        const stepNumber = step.index;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isLast = index === steps.length - 1;
        const isDone = isActive || isCompleted;

        return (
          <div
            key={stepNumber}
            className="flex gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
          >
            {/* Left: circle indicator + connector line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isDone
                    ? "bg-primary text-white"
                    : "border border-sidebar-foreground/25 text-sidebar-foreground/40",
                )}
                title={`${step.label}: ${step.title}`}
              >
                {isDone ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber + 1}</span>
                )}
              </div>
              {!isLast && (
                <div className="my-1 flex-1 w-px bg-sidebar-foreground/10" />
              )}
            </div>

            {/* Right: step label + title — hidden when sidebar is collapsed */}
            <div
              className={cn(
                "pt-1 overflow-hidden group-data-[collapsible=icon]:hidden",
                !isLast && "pb-6",
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium mb-0.5",
                  isDone ? "text-primary" : "text-sidebar-foreground/40",
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  isDone
                    ? "text-sidebar-foreground"
                    : "text-sidebar-foreground/40",
                )}
              >
                {step.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
