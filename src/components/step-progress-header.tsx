import { Progress } from "@/components/ui/progress";

interface StepProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgressHeader({ currentStep, totalSteps }: StepProgressHeaderProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-semibold text-primary">{percentage}% COMPLETE</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
