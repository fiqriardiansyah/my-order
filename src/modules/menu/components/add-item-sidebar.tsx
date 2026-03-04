import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectMenu } from "@/components/select-menu";
import { useCreateMenu, useCreateMenuCategory } from "@/modules/menu/queries/use-menu-items";
import type { MenuItemFormValues } from "../schemas/menu-item.schema";

interface Menu {
  id: string;
  name: string;
  is_default: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  control: Control<MenuItemFormValues>;
  errors: FieldErrors<MenuItemFormValues>;
  restaurantId: string | null | undefined;
  menus: Menu[];
  categories: Category[];
  selectedMenuId: string;
  onMenuChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function AddItemSidebar({
  control,
  errors,
  restaurantId,
  menus,
  categories,
  selectedMenuId,
  onMenuChange,
  onCategoryChange,
}: Props) {
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [menuName, setMenuName] = useState("");

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryIsVisible, setCategoryIsVisible] = useState(true);

  const { mutateAsync: createMenu, isPending: isMenuPending } = useCreateMenu();
  const { mutateAsync: createCategory, isPending: isCategoryPending } = useCreateMenuCategory();

  async function handleCreateMenu() {
    if (!restaurantId || !menuName.trim()) return;
    const created = await createMenu({
      restaurantId,
      name: menuName.trim(),
      is_active: true,
      is_default: false,
    });
    onMenuChange(created.id);
    setMenuName("");
    setMenuDialogOpen(false);
  }

  async function handleCreateCategory() {
    if (!restaurantId || !selectedMenuId || !categoryName.trim()) return;
    const created = await createCategory({
      restaurantId,
      menuId: selectedMenuId,
      name: categoryName.trim(),
      description: categoryDescription.trim() || undefined,
      is_visible: categoryIsVisible,
    });
    onCategoryChange(created.id);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryIsVisible(true);
    setCategoryDialogOpen(false);
  }

  return (
    <>
      {/* classification */}
      <div className="space-y-4">
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
            onValueChange={onMenuChange}
            placeholder="Select menu..."
            searchPlaceholder="Search menu..."
            footerAction={{
              label: "Create New Menu",
              onClick: () => setMenuDialogOpen(true),
            }}
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
                onValueChange={onCategoryChange}
                placeholder={
                  selectedMenuId ? "Select category..." : "Select menu first..."
                }
                searchPlaceholder="Search category..."
                footerAction={
                  selectedMenuId
                    ? { label: "Create New Category", onClick: () => setCategoryDialogOpen(true) }
                    : undefined
                }
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
      </div>

      {/* visibility */}
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
                htmlFor={name}
                className="cursor-pointer text-sm font-normal"
              >
                {label}
              </Label>
              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <Switch
                    id={name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* editor tip */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="flex gap-2">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Editor Tip
            </p>
            <p className="mt-0.5 text-xs text-blue-600/80 dark:text-blue-400/80">
              Featured items appear at the top of their category with larger
              photos.
            </p>
          </div>
        </div>
      </div>

      {/* create menu dialog */}
      <Dialog
        open={menuDialogOpen}
        onOpenChange={(open) => {
          setMenuDialogOpen(open);
          if (!open) setMenuName("");
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Menu</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nama menu, contoh: Lunch, Drinks"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateMenu()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMenuDialogOpen(false)}
              disabled={isMenuPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateMenu}
              disabled={isMenuPending || !menuName.trim()}
            >
              {isMenuPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* create category dialog */}
      <Dialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) {
            setCategoryName("");
            setCategoryDescription("");
            setCategoryIsVisible(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="Contoh: Minuman, Makanan Utama"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <textarea
                id="cat-desc"
                rows={3}
                placeholder="Deskripsi singkat kategori ini (opsional)"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cat-visible" className="cursor-pointer font-normal">
                Visible on menu
              </Label>
              <Switch
                id="cat-visible"
                checked={categoryIsVisible}
                onCheckedChange={setCategoryIsVisible}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
              disabled={isCategoryPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isCategoryPending || !categoryName.trim()}
            >
              {isCategoryPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
