import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  restaurantProfileSchema,
  type RestaurantProfileFormValues,
} from "../../schemas/restaurant-profile.schema";
import { StepProgressHeader } from "@/components/step-progress-header";
import { FormField } from "@/components/form/form-field";
import { UploadField } from "@/components/form/upload-field";
import { PhoneField } from "@/components/form/phone-field";
import { SelectField } from "@/components/form/select-field";
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from "./constants";
import { Badge } from "@/components/ui/badge";

interface RestaurantProfileStepProps {
  onNext?: (data: RestaurantProfileFormValues) => void;
  defaultValues?: Partial<RestaurantProfileFormValues>;
  isLoading?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export function RestaurantProfileStep({
  onNext,
  defaultValues,
  isLoading = false,
  currentStep = 1,
  totalSteps = 4,
}: RestaurantProfileStepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues: {
      name: "",
      logo_url: "",
      address: "",
      phone: "",
      country_code: "ID",
      currency: "IDR",
      timezone: "Asia/Jakarta",
      ...defaultValues,
    },
  });

  const countryCode = watch("country_code");
  const phone = watch("phone");

  const onSubmit = (data: RestaurantProfileFormValues) => {
    onNext?.(data);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-6">
      <StepProgressHeader currentStep={currentStep} totalSteps={totalSteps} />

      <Card>
        <CardHeader>
          <Badge variant="secondary">Getting Started</Badge>
          <CardTitle className="text-xl">
            Let's set up your restaurant
          </CardTitle>
          <CardDescription>This takes less than 5 minutes</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Restaurant Name */}
            <FormField
              label="Restaurant Name"
              htmlFor="name"
              error={errors.name?.message}
              required
            >
              <Input
                id="name"
                placeholder="e.g. The Golden Bistro"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
            </FormField>

            {/* Logo */}
            <FormField required label="Logo" error={errors.logo_url?.message}>
              <Controller
                control={control}
                name="logo_url"
                render={({ field }) => (
                  <UploadField
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.logo_url}
                  />
                )}
              />
            </FormField>

            {/* Address */}
            <FormField
              required
              label="Address"
              htmlFor="address"
              error={errors.address?.message}
            >
              <Input
                id="address"
                placeholder="123 Culinary St, Jakarta"
                aria-invalid={!!errors.address}
                {...register("address")}
              />
            </FormField>

            {/* Phone + Currency row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                required
                label="Phone Number"
                error={errors.phone?.message}
              >
                <PhoneField
                  countryCode={countryCode || ""}
                  phone={phone ?? ""}
                  onCountryChange={(code) => setValue("country_code", code)}
                  onPhoneChange={(p) => setValue("phone", p)}
                />
              </FormField>

              <FormField
                required
                label="Currency"
                htmlFor="currency"
                error={errors.currency?.message}
              >
                <SelectField
                  id="currency"
                  options={CURRENCY_OPTIONS}
                  aria-invalid={!!errors.currency}
                  {...register("currency")}
                />
              </FormField>
            </div>

            {/* Timezone */}
            <FormField
              required
              label="Timezone"
              htmlFor="timezone"
              error={errors.timezone?.message}
            >
              <SelectField
                id="timezone"
                options={TIMEZONE_OPTIONS}
                aria-invalid={!!errors.timezone}
                {...register("timezone")}
              />
            </FormField>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              Continue
              <ArrowRight />
            </Button>
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
