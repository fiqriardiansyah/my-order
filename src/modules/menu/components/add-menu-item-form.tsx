import type { ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/form/form-field";
import { UploadField } from "@/components/form/upload-field";
import { Input } from "@/components/ui/input";
import { AddItemSidebar } from "./add-item-sidebar";
import { ModifiersField } from "./modifiers-field";
import { VariantsField } from "./variants-field";
import { useMenuCategories, useMenus } from "@/modules/menu/queries/use-menu-items";
import {
  menuItemSchema,
  type MenuItemFormValues,
} from "@/modules/menu/schemas/menu-item.schema";

// ─── constants ────────────────────────────────────────────────────────────────

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

// ─── types ────────────────────────────────────────────────────────────────────

interface Props {
  restaurantId: string | undefined | null;
  /** Called when the form is submitted. Receives the form values and the resolved category name. */
  onSubmit: (values: MenuItemFormValues, categoryName: string) => void | Promise<void>;
  formId?: string;
  defaultValues?: Partial<MenuItemFormValues>;
  /** "page" renders a two-column sidebar + main layout. "modal" stacks everything vertically. */
  layout?: "page" | "modal";
  /** "add" resets the form after submit (keeping menu/category). "edit" does not reset. Default "add". */
  mode?: "add" | "edit";
  /** Which side the sidebar appears on in page layout. Default "left". */
  sidebarSide?: "left" | "right";
  disabled?: boolean;
  /** Extra content rendered after the form in the main area (page layout only, e.g. a queue list). */
  children?: ReactNode;
}

// ─── component ────────────────────────────────────────────────────────────────

export function AddMenuItemForm({
  restaurantId,
  onSubmit,
  formId = "add-menu-item-form",
  defaultValues,
  layout = "page",
  mode = "add",
  sidebarSide = "left",
  disabled = false,
  children,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const selectedMenuId = useWatch({ control, name: "menu_id" });

  const { data: menus = [] } = useMenus(restaurantId);
  const { data: categories = [] } = useMenuCategories(
    restaurantId,
    selectedMenuId ? [selectedMenuId] : null,
  );

  function handleMenuChange(value: string) {
    setValue("menu_id", value, { shouldValidate: true });
    setValue("category_id", "");
  }

  function handleCategoryChange(value: string) {
    setValue("category_id", value, { shouldValidate: true });
  }

  async function handleFormSubmit(values: MenuItemFormValues) {
    const category = categories.find((c) => c.id === values.category_id);
    await onSubmit(values, category?.name ?? "");
    if (mode === "add") {
      reset({
        ...DEFAULT_VALUES,
        menu_id: values.menu_id,
        category_id: values.category_id,
      });
    }
  }

  const sidebarProps = {
    control,
    errors,
    restaurantId,
    menus,
    categories,
    selectedMenuId,
    onMenuChange: handleMenuChange,
    onCategoryChange: handleCategoryChange,
  };

  const formFields = (
    <>
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
            disabled={disabled}
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
              disabled={disabled}
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
            disabled={disabled}
            {...register("description")}
          />
        </FormField>
      </div>

      {/* row 3: variants + modifiers */}
      <div className="grid grid-cols-2 gap-6">
        <VariantsField control={control} register={register} errors={errors} />
        <ModifiersField control={control} register={register} errors={errors} />
      </div>
    </>
  );

  if (layout === "modal") {
    return (
      <form
        id={formId}
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        className="space-y-6"
      >
        <AddItemSidebar {...sidebarProps} />
        {formFields}
      </form>
    );
  }

  // layout === "page"
  const formEl = (
    <main className="flex-1 overflow-y-auto">
      <form
        id={formId}
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        className="space-y-6 p-6"
      >
        {formFields}
      </form>
      {children}
    </main>
  );

  const sidebarLeft = (
    <aside className="w-64 shrink-0 space-y-6 overflow-y-auto border-r pr-4">
      <AddItemSidebar {...sidebarProps} />
    </aside>
  );

  const sidebarRight = (
    <aside className="w-56 shrink-0 space-y-6 overflow-y-auto border-l p-5">
      <AddItemSidebar {...sidebarProps} />
    </aside>
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {sidebarSide === "left" ? sidebarLeft : null}
      {formEl}
      {sidebarSide === "right" ? sidebarRight : null}
    </div>
  );
}
