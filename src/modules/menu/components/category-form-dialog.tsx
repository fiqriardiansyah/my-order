import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useCreateMenuCategory,
  useUpdateMenuCategory,
  type MenuCategoryDetail,
} from "@/hooks/api/use-menu-categories";

const schema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional(),
  is_visible: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  menuId: string;
  category?: MenuCategoryDetail;
}

export function CategoryFormDialog({
  open,
  onClose,
  restaurantId,
  menuId,
  category,
}: CategoryFormDialogProps) {
  const isEdit = !!category;
  const createMutation = useCreateMenuCategory();
  const updateMutation = useUpdateMenuCategory();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", is_visible: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              description: category.description ?? "",
              is_visible: category.is_visible,
            }
          : { name: "", description: "", is_visible: true },
      );
    }
  }, [open, category, reset]);

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: category!.id,
          name: values.name,
          description: values.description,
          is_visible: values.is_visible,
        },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(
        {
          restaurantId,
          menuId,
          name: values.name,
          description: values.description,
          is_visible: values.is_visible,
        },
        { onSuccess: onClose },
      );
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Nama Kategori</Label>
            <Input
              id="cat-name"
              placeholder="mis. Main Course"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Deskripsi</Label>
            <textarea
              id="cat-desc"
              rows={2}
              placeholder="Deskripsi kategori (opsional)"
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              {...register("description")}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="cat-visible" className="cursor-pointer">
              Tampilkan di Menu
            </Label>
            <Controller
              control={control}
              name="is_visible"
              render={({ field }) => (
                <Switch
                  id="cat-visible"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
