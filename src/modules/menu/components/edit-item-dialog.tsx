import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useMenuItemDetail,
  useUpdateMenuItem,
} from "@/hooks/api/use-menu-items";
import type { MenuItemFormValues } from "@/modules/menu/schemas/menu-item.schema";
import { AddMenuItemForm } from "./add-menu-item-form";

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

// ─── dialog ───────────────────────────────────────────────────────────────────

export function EditItemDialog({ itemId, restaurantId, onClose }: Props) {
  const { data: detail, isLoading } = useMenuItemDetail(itemId);
  const { mutateAsync: updateMenuItem, isPending } = useUpdateMenuItem();

  async function handleSave(values: MenuItemFormValues) {
    if (!itemId || !restaurantId) return;
    try {
      await updateMenuItem({ id: itemId, restaurantId, values });
      toast.success("Item berhasil diperbarui");
      onClose();
    } catch {
      toast.error("Gagal memperbarui item. Silakan coba lagi.");
    }
  }

  const defaultValues: Partial<MenuItemFormValues> | undefined = detail
    ? {
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
      }
    : undefined;

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
          <AddMenuItemForm
            key={itemId}
            formId="edit-item-form"
            mode="edit"
            sidebarSide="right"
            restaurantId={restaurantId}
            defaultValues={defaultValues}
            onSubmit={handleSave}
            disabled={isPending}
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
