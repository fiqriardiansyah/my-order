import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";

import { FormField } from "@/components/form/form-field";
import { UploadField } from "@/components/form/upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddItemSidebar } from "@/modules/menu/components/add-item-sidebar";
import { ModifiersField } from "@/modules/menu/components/modifiers-field";
import { VariantsField } from "@/modules/menu/components/variants-field";
import {
  useCreateMenuItem,
  useMenuCategories,
  useMenus,
} from "@/modules/menu/queries/use-menu-items";
import {
  menuItemSchema,
  type MenuItemFormValues,
} from "@/modules/menu/schemas/menu-item.schema";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";

// ─── types ────────────────────────────────────────────────────────────────────

type QueueEntry = MenuItemFormValues & {
  _id: string;
  _categoryName: string;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_VALUES: MenuItemFormValues = {
  name: "",
  description: "",
  base_price: 0,
  image_url: null,
  show_on_menu: true,
  is_available: true,
  is_featured: false,
  menu_id: "",
  category_id: "",
  variants: [],
  modifiers: [],
};

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function MenuAddPage() {
  const navigate = useNavigate();
  const { data: onboarding } = useOnboardingStatus();
  const restaurantId = onboarding?.restaurantId;

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const selectedMenuId = useWatch({ control, name: "menu_id" });

  const { data: menus = [] } = useMenus(restaurantId);
  const { data: categories = [] } = useMenuCategories(
    restaurantId,
    selectedMenuId || null,
  );

  const { mutateAsync: createMenuItem } = useCreateMenuItem();

  function addToQueue(values: MenuItemFormValues) {
    const category = categories.find((c) => c.id === values.category_id);
    setQueue((prev) => [
      ...prev,
      { ...values, _id: crypto.randomUUID(), _categoryName: category?.name ?? "" },
    ]);
    reset({
      ...DEFAULT_VALUES,
      menu_id: values.menu_id,
      category_id: values.category_id,
    });
  }

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((e) => e._id !== id));
  }

  async function saveAll() {
    if (!restaurantId || queue.length === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(
        queue.map((entry) => createMenuItem({ restaurantId, values: entry })),
      );
      toast.success(
        queue.length === 1
          ? "Item berhasil disimpan"
          : `${queue.length} item berhasil disimpan`,
      );
      navigate("/menu");
    } catch {
      toast.error("Gagal menyimpan item. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleMenuChange(value: string) {
    setValue("menu_id", value, { shouldValidate: true });
    setValue("category_id", "");
  }

  function handleCategoryChange(value: string) {
    setValue("category_id", value, { shouldValidate: true });
  }

  const isDisabled = isSubmitting || isSaving || !restaurantId;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-5 p-5">
      {/* ── header ── */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-8 shrink-0"
            onClick={() => navigate("/menu")}
            aria-label="Kembali"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold leading-tight">Tambah Item Menu</h1>
            <p className="text-muted-foreground text-sm">
              Tambah item baru ke daftar menu restoran Anda.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="add-item-form"
            variant="outline"
            disabled={isDisabled}
          >
            + Tambah ke Daftar
          </Button>
          {queue.length > 0 && (
            <Button onClick={saveAll} disabled={isSaving}>
              {isSaving ? "Menyimpan…" : `Simpan Semua (${queue.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* ── body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── sidebar ── */}
        <aside className="w-64 shrink-0 space-y-6 overflow-y-auto border-r pr-4">
          <AddItemSidebar
            control={control}
            errors={errors}
            restaurantId={restaurantId}
            menus={menus}
            categories={categories}
            selectedMenuId={selectedMenuId}
            onMenuChange={handleMenuChange}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        {/* ── main ── */}
        <main className="flex-1 overflow-y-auto">
          <form
            id="add-item-form"
            onSubmit={handleSubmit(addToQueue)}
            noValidate
            className="space-y-6 px-6 pt-6"
          >
            {/* row 1: name + price */}
            <div className="grid grid-cols-[1fr_200px] gap-4">
              <FormField
                label="Nama Item (Item Name)"
                htmlFor="name"
                error={errors.name?.message}
                required
              >
                <Input
                  id="name"
                  placeholder="Contoh: Americano Ice, Nasi Goreng Spesial"
                  autoFocus
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </FormField>

              <FormField
                label="Harga Dasar (Base Price)"
                htmlFor="base_price"
                error={errors.base_price?.message}
                required
              >
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 select-none text-sm">
                    Rp
                  </span>
                  <Input
                    id="base_price"
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

            {/* row 2: image + description */}
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
                htmlFor="description"
                error={errors.description?.message}
              >
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Deskripsi singkat tentang item ini..."
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[120px] w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
                  {...register("description")}
                />
              </FormField>
            </div>

            {/* row 3: variants + modifiers */}
            <div className="grid grid-cols-2 gap-6">
              <VariantsField control={control} register={register} errors={errors} />
              <ModifiersField control={control} register={register} errors={errors} />
            </div>
          </form>

          {/* ── queue ── */}
          {queue.length > 0 && (
            <div className="mt-6 px-6 pb-6">
              <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
                Daftar Item ({queue.length})
              </p>
              <div className="divide-y rounded-lg border">
                {queue.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {entry._categoryName && `${entry._categoryName} · `}
                        {formatRp(entry.base_price)}
                        {entry.variants.length > 0 &&
                          ` · ${entry.variants.length} varian`}
                        {entry.modifiers.length > 0 &&
                          ` · ${entry.modifiers.length} modifier`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive size-7 shrink-0"
                      onClick={() => removeFromQueue(entry._id)}
                      aria-label="Hapus dari daftar"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
