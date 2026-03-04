import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/form/form-field";
import { UploadField } from "@/components/form/upload-field";
import { SelectMenu } from "@/components/select-menu";
import {
  useMenuItemDetail,
  useUpdateMenuItem,
  useMenus,
  useMenuCategories,
} from "@/modules/menu/queries/use-menu-items";
import {
  menuItemSchema,
  type MenuItemFormValues,
} from "@/modules/menu/schemas/menu-item.schema";
import { VariantsField } from "./variants-field";
import { ModifiersField } from "./modifiers-field";

// ─── types ────────────────────────────────────────────────────────────────────

interface Props {
  itemId: string | null;
  restaurantId: string | null | undefined;
  onClose: () => void;
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-[1fr_180px] gap-4">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      </div>
      <div className="w-56 shrink-0 space-y-5 border-l p-5">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}

// ─── form ─────────────────────────────────────────────────────────────────────

function EditForm({
  itemId,
  restaurantId,
  detail,
  onClose,
}: {
  itemId: string;
  restaurantId: string;
  detail: NonNullable<ReturnType<typeof useMenuItemDetail>["data"]>;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: detail.name,
      description: detail.description ?? "",
      base_price: detail.base_price,
      image_url: detail.image_url,
      show_on_menu: true,
      is_available: detail.is_available,
      is_featured: detail.is_featured,
      menu_id: detail.menu_id,
      category_id: detail.category_id,
      variants: detail.variants.map((v) => ({
        name: v.name,
        price_modifier: v.price_modifier,
      })),
      modifiers: detail.modifiers.map((m) => ({
        name: m.name,
        price_modifier: m.price_modifier,
      })),
    },
  });

  useEffect(() => {
    reset({
      name: detail.name,
      description: detail.description ?? "",
      base_price: detail.base_price,
      image_url: detail.image_url,
      show_on_menu: true,
      is_available: detail.is_available,
      is_featured: detail.is_featured,
      menu_id: detail.menu_id,
      category_id: detail.category_id,
      variants: detail.variants.map((v) => ({
        name: v.name,
        price_modifier: v.price_modifier,
      })),
      modifiers: detail.modifiers.map((m) => ({
        name: m.name,
        price_modifier: m.price_modifier,
      })),
    });
  }, [detail, reset]);

  const selectedMenuId = useWatch({ control, name: "menu_id" });

  const { data: menus = [] } = useMenus(restaurantId);
  const { data: categories = [] } = useMenuCategories(
    restaurantId,
    selectedMenuId || null,
  );

  function handleMenuChange(value: string) {
    setValue("menu_id", value, { shouldValidate: true });
    setValue("category_id", "");
  }

  function handleCategoryChange(value: string) {
    setValue("category_id", value, { shouldValidate: true });
  }

  const { mutateAsync: updateMenuItem } = useUpdateMenuItem();

  async function onSubmit(values: MenuItemFormValues) {
    try {
      await updateMenuItem({ id: itemId, restaurantId, values });
      toast.success("Item berhasil diperbarui");
      onClose();
    } catch {
      toast.error("Gagal memperbarui item. Silakan coba lagi.");
    }
  }

  return (
    <form
      id="edit-item-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-1 overflow-hidden"
    >
      {/* ── left sidebar: classification + visibility ── */}
      <aside className="w-56 shrink-0 space-y-6 overflow-y-auto border-l p-5">
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Primary Menu
          </p>
          <SelectMenu
            options={menus.map((m) => ({
              value: m.id,
              label: m.name,
              meta: m.is_default ? "Default" : undefined,
            }))}
            value={selectedMenuId}
            onValueChange={handleMenuChange}
            placeholder="Select menu..."
            searchPlaceholder="Search menu..."
            className="w-full"
          />
          {errors.menu_id && (
            <p className="text-destructive text-xs">{errors.menu_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Category
          </p>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <SelectMenu
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                value={field.value}
                onValueChange={handleCategoryChange}
                placeholder={
                  selectedMenuId ? "Select category..." : "Select menu first..."
                }
                searchPlaceholder="Search category..."
                className="w-full"
              />
            )}
          />
          {errors.category_id && (
            <p className="text-destructive text-xs">
              {errors.category_id.message}
            </p>
          )}
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
            Visibility
          </p>
          <div className="space-y-3">
            {(
              [
                { name: "is_available", label: "Available Now" },
                { name: "is_featured", label: "Featured Item" },
              ] as const
            ).map(({ name, label }) => (
              <div key={name} className="flex items-center justify-between">
                <Label
                  htmlFor={`edit-${name}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {label}
                </Label>
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <Switch
                      id={`edit-${name}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── main ── */}
      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* name + price */}
        <div className="grid grid-cols-[1fr_180px] gap-4">
          <FormField
            label="Nama Item"
            htmlFor="edit-name"
            error={errors.name?.message}
            required
          >
            <Input
              id="edit-name"
              placeholder="Contoh: Americano Ice"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Harga Dasar"
            htmlFor="edit-base_price"
            error={errors.base_price?.message}
            required
          >
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 select-none text-sm">
                Rp
              </span>
              <Input
                id="edit-base_price"
                type="number"
                min={0}
                step={500}
                placeholder="0"
                className="pl-9"
                aria-invalid={!!errors.base_price}
                {...register("base_price", { valueAsNumber: true })}
              />
            </div>
          </FormField>
        </div>

        {/* image + description */}
        <div className="grid grid-cols-[160px_1fr] gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Item Image</p>
            <Controller
              control={control}
              name="image_url"
              render={({ field }) => (
                <UploadField
                  value={field.value ?? null}
                  onChange={field.onChange}
                  error={!!errors.image_url}
                />
              )}
            />
          </div>

          <FormField
            label="Description"
            htmlFor="edit-description"
            error={errors.description?.message}
          >
            <textarea
              id="edit-description"
              rows={5}
              placeholder="Deskripsi singkat tentang item ini..."
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-30 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
              {...register("description")}
            />
          </FormField>
        </div>

        {/* variants + modifiers */}
        <div className="grid grid-cols-2 gap-4">
          <VariantsField
            control={control}
            register={register}
            errors={errors}
          />
          <ModifiersField
            control={control}
            register={register}
            errors={errors}
          />
        </div>
      </main>
    </form>
  );
}

// ─── dialog ───────────────────────────────────────────────────────────────────

export function EditItemDialog({ itemId, restaurantId, onClose }: Props) {
  const { data: detail, isLoading } = useMenuItemDetail(itemId);
  const { isPending } = useUpdateMenuItem();

  return (
    <Dialog open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-[85vh] sm:max-w-5xl flex-col gap-0 p-0"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Edit Item Menu</DialogTitle>
        </DialogHeader>

        {isLoading || !detail || !restaurantId ? (
          <EditSkeleton />
        ) : (
          <EditForm
            itemId={itemId!}
            restaurantId={restaurantId}
            detail={detail}
            onClose={onClose}
          />
        )}

        <DialogFooter className="shrink-0 border-t px-6 py-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            type="submit"
            form="edit-item-form"
            disabled={isPending || isLoading}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
