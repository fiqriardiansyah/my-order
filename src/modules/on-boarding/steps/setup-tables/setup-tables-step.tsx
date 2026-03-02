import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  setupTablesSchema,
  type SetupTablesFormValues,
} from "../../schemas/setup-tables.schema";
import { StepProgressHeader } from "@/components/step-progress-header";
import { TableCounter } from "./components/table-counter";
import { NamingStylePicker } from "./components/naming-style-picker";
import { ZoneManager } from "./components/zone-manager";
import { TablesPreview } from "./components/tables-preview";
import { generateTables } from "./utils";

interface SetupTablesStepProps {
  onNext?: (data: SetupTablesFormValues) => void;
  onBack?: () => void;
  defaultValues?: Partial<SetupTablesFormValues>;
  currentStep?: number;
  totalSteps?: number;
  isLoading?: boolean;
}

export function SetupTablesStep({
  onNext,
  onBack,
  defaultValues,
  currentStep = 3,
  totalSteps = 4,
  isLoading = false,
}: SetupTablesStepProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(setupTablesSchema),
    defaultValues: {
      count: 5,
      namingStyle: "numbered",
      zones: [],
      ...defaultValues,
    },
  });

  const count = watch("count");
  const namingStyle = watch("namingStyle");
  const zones = watch("zones");

  const previewTables = generateTables(count, namingStyle!, zones!);

  const onSubmit = (data: SetupTablesFormValues) => {
    onNext?.(data);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-6">
      <StepProgressHeader currentStep={currentStep} totalSteps={totalSteps} />

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Table Configuration
          </Badge>
          <CardTitle className="text-xl">
            How many tables do you have?
          </CardTitle>
          <CardDescription>
            Each table gets its own unique QR code. You can add more anytime.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Table count picker */}
            <Controller
              control={control}
              name="count"
              render={({ field }) => (
                <TableCounter value={field.value} onChange={field.onChange} />
              )}
            />

            <Separator />

            {/* Naming style */}
            <Controller
              control={control}
              name="namingStyle"
              render={({ field }) => (
                <NamingStylePicker
                  value={field.value!}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Zone grouping */}
            <Controller
              control={control}
              name="zones"
              render={({ field }) => (
                <ZoneManager zones={field.value!} onChange={field.onChange} />
              )}
            />

            {/* Preview */}
            <TablesPreview tables={previewTables} />

            {/* Navigation */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isSubmitting || isLoading}
              >
                Generate Tables
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            You can rename or reorganize tables later in Settings
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
