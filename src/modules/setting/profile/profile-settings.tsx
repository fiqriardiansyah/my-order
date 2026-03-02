import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuth } from "@/modules/auth/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/form/form-field";
import { UploadField } from "@/components/form/upload-field";

import { profileSchema, type ProfileFormValues } from "./schema";
import { useProfile } from "./use-profile";
import { useUpdateProfile } from "./use-update-profile";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type ProfileData = NonNullable<ReturnType<typeof useProfile>["data"]>;

function ProfileForm({ profile }: { profile: ProfileData }) {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url ?? null,
    },
  });

  const avatarUrl = watch("avatar_url");

  function onSubmit(values: ProfileFormValues) {
    updateProfile(values, {
      onSuccess: () => toast.success("Profile updated"),
      onError: (e) =>
        toast.error("Failed to update profile", { description: e.message }),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your name and profile picture.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Avatar */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <UploadField
              value={avatarUrl}
              onChange={(val) =>
                setValue("avatar_url", val, { shouldDirty: true })
              }
              error={!!errors.avatar_url}
            />
          </div>

          {/* Full Name */}
          <FormField
            label="Full Name"
            htmlFor="full_name"
            error={errors.full_name?.message}
            required
          >
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Your full name"
            />
          </FormField>

          {/* Email — read-only, comes from auth.users */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email ?? ""}
              disabled
              className="bg-muted/50"
            />
          </div>

          <Separator />

          {/* Role & Member Since */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex h-9 items-center">
                <Badge variant="secondary" className="capitalize">
                  {profile.role?.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="flex h-9 items-center text-sm text-muted-foreground">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          {/* Last Login */}
          <div className="space-y-2">
            <Label>Last Login</Label>
            <p className="text-sm text-muted-foreground">
              {profile.last_login_at ? formatDate(profile.last_login_at) : "—"}
            </p>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6 justify-end">
          <Button type="submit" disabled={!isDirty || isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileSettings() {
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      {isLoading || !profile ? (
        <ProfileSkeleton />
      ) : (
        <ProfileForm profile={profile} />
      )}
    </div>
  );
}
