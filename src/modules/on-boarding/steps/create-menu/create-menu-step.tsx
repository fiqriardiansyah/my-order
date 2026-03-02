import { useRef } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";

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
  createMenuSchema,
  type CreateMenuFormValues,
} from "../../schemas/create-menu.schema";
import { StepProgressHeader } from "@/components/step-progress-header";
import { CategoryChipsBar } from "./components/category-chips-bar";
import { AddCategoryForm } from "./components/add-category-form";
import { CategorySection } from "./components/category-section";

interface CreateMenuStepProps {
  onNext?: (data: CreateMenuFormValues) => void;
  onBack?: () => void;
  defaultValues?: Partial<CreateMenuFormValues>;
  isLoading?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export function CreateMenuStep({
  onNext,
  onBack,
  defaultValues,
  isLoading = false,
  currentStep = 2,
  totalSteps = 4,
}: CreateMenuStepProps) {
  const addInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateMenuFormValues>({
    resolver: zodResolver(createMenuSchema) as unknown as Resolver<CreateMenuFormValues>,
    defaultValues: {
      menu_name: "Main Menu",
      categories: [],
      ...defaultValues,
    },
  });

  const {
    fields: categoryFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "categories",
  });

  const categories = watch("categories");

  const scrollToAddForm = () => {
    addInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    addInputRef.current?.focus();
  };

  const onSubmit = (data: CreateMenuFormValues) => {
    onNext?.(data);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-6">
      <StepProgressHeader currentStep={currentStep} totalSteps={totalSteps} />

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Menu Setup
          </Badge>
          <CardTitle className="text-xl">Build your menu categories</CardTitle>
          <CardDescription>
            Categories organize your items — like Coffee, Food, Desserts
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Category chips overview */}
            <CategoryChipsBar
              categories={categories}
              onRemove={remove}
              onAddClick={scrollToAddForm}
            />

            <Separator />

            {/* Add category input */}
            <AddCategoryForm
              inputRef={addInputRef}
              onAdd={({ name, icon }) => append({ name, icon, items: [] })}
            />

            {/* Category accordion sections */}
            {categoryFields.length > 0 && (
              <div className="space-y-2">
                {categoryFields.map((field, index) => (
                  <CategorySection
                    key={field.id}
                    control={control}
                    categoryIndex={index}
                    name={categories[index]?.name ?? ""}
                    icon={categories[index]?.icon ?? "🍽️"}
                    defaultOpen={index === 0}
                  />
                ))}
              </div>
            )}

            {/* Hint banner */}
            <div className="flex items-start gap-2.5 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p>
                You can add prices, photos, and variants after completing setup
              </p>
            </div>

            {errors.categories && (
              <p className="text-xs text-destructive">
                {errors.categories.message}
              </p>
            )}

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
                Continue to Tables
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            You can change all of this later in Settings
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
