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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { TableFormValues, TableWithQR, TableZone } from "@/@types/tables";
import { useCreateTable, useUpdateTable } from "@/hooks/api/use-tables";

const schema = z.object({
  name: z.string().min(1, "Nama meja wajib diisi"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan tanda hubung"),
  zone_id: z.string().nullable(),
  capacity: z.number().int().positive().nullable(),
  is_active: z.boolean(),
});

import { toSlug } from "@/modules/tables/utils";

interface TableFormDialogProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  zones: TableZone[];
  table?: TableWithQR;
}

export function TableFormDialog({
  open,
  onClose,
  restaurantId,
  zones,
  table,
}: TableFormDialogProps) {
  const isEdit = !!table;
  const createMutation = useCreateTable();
  const updateMutation = useUpdateTable();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TableFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      zone_id: null,
      capacity: null,
      is_active: true,
    },
  });

  // reset when dialog opens / changes target
  useEffect(() => {
    if (open) {
      reset(
        table
          ? {
              name: table.name,
              slug: table.slug,
              zone_id: table.zone_id,
              capacity: table.capacity,
              is_active: table.is_active,
            }
          : { name: "", slug: "", zone_id: null, capacity: null, is_active: true },
      );
    }
  }, [open, table, reset]);

  // auto-fill slug from name when creating
  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit) {
      setValue("slug", toSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  function onSubmit(values: TableFormValues) {
    if (isEdit) {
      updateMutation.mutate(
        { id: table.id, restaurantId, values },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate({ restaurantId, values }, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Meja" : "Tambah Meja"}</DialogTitle>
        </DialogHeader>

        <form id="table-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="table-name">Nama Meja</Label>
            <Input
              id="table-name"
              placeholder="Contoh: Table 1"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="table-slug">
              Slug{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (digunakan di URL QR)
              </span>
            </Label>
            <Input
              id="table-slug"
              placeholder="table-1"
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-destructive text-xs">{errors.slug.message}</p>
            )}
          </div>

          {/* Zone */}
          <div className="space-y-1.5">
            <Label>Zona</Label>
            <Controller
              control={control}
              name="zone_id"
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tidak ada zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada zona</SelectItem>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Capacity */}
          <div className="space-y-1.5">
            <Label htmlFor="table-capacity">
              Kapasitas{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (opsional)
              </span>
            </Label>
            <Input
              id="table-capacity"
              type="number"
              min={1}
              placeholder="Jumlah kursi"
              {...register("capacity", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
              })}
            />
            {errors.capacity && (
              <p className="text-destructive text-xs">{errors.capacity.message}</p>
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Aktif</p>
              <p className="text-muted-foreground text-xs">
                Meja tersedia untuk pemesanan
              </p>
            </div>
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="table-form" disabled={isPending}>
            {isPending ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
