import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuItemRow } from "@/hooks/api/use-menu-items";

interface DeleteDialogProps {
  item: MenuItemRow | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteDialog({
  item,
  onClose,
  onConfirm,
  isPending,
}: DeleteDialogProps) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus menu item?</DialogTitle>
          <DialogDescription>
            <strong>{item?.name}</strong> akan dihapus secara permanen dan tidak
            dapat dikembalikan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Menghapus…" : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
