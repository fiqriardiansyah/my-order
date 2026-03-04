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
  useCreateMenu,
  useUpdateMenu,
  type MenuWithCount,
} from "@/hooks/api/use-menus";

const schema = z.object({
  name: z.string().min(1, "Nama menu wajib diisi"),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface MenuFormDialogProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  menu?: MenuWithCount;
}

export function MenuFormDialog({
  open,
  onClose,
  restaurantId,
  menu,
}: MenuFormDialogProps) {
  const isEdit = !!menu;
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        menu
          ? { name: menu.name, is_active: menu.is_active }
          : { name: "", is_active: true },
      );
    }
  }, [open, menu, reset]);

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateMutation.mutate(
        { id: menu!.id, name: values.name, is_active: values.is_active },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(
        {
          restaurantId,
          name: values.name,
          is_active: values.is_active,
          is_default: false,
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
          <DialogTitle>{isEdit ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="menu-name">Nama Menu</Label>
            <Input
              id="menu-name"
              placeholder="mis. Dinner Menu"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="menu-active" className="cursor-pointer">
              Aktif
            </Label>
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <Switch
                  id="menu-active"
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
