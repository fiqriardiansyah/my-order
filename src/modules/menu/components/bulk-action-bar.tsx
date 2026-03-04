import { useState } from "react";
import { Trash2, EyeOff, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteMany: () => void;
  onMarkAvailable: () => void;
  onMarkUnavailable: () => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDeleteMany,
  onMarkAvailable,
  onMarkUnavailable,
  isDeleting,
  isUpdating,
}: BulkActionBarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="bg-primary text-primary-foreground flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium shadow-md">
        <button
          onClick={onClearSelection}
          className="hover:bg-primary-foreground/20 -ml-1 rounded p-0.5 transition-colors"
          aria-label="Batal pilih"
        >
          <X className="size-4" />
        </button>

        <span className="flex-1">
          {selectedCount} item dipilih
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 gap-1.5 text-xs"
            onClick={onMarkAvailable}
            disabled={isUpdating || isDeleting}
          >
            <Eye className="size-3.5" />
            Tersedia
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className="h-7 gap-1.5 text-xs"
            onClick={onMarkUnavailable}
            disabled={isUpdating || isDeleting}
          >
            <EyeOff className="size-3.5" />
            Habis
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting || isUpdating}
          >
            <Trash2 className="size-3.5" />
            Hapus
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus {selectedCount} item?</DialogTitle>
            <DialogDescription>
              {selectedCount} menu item yang dipilih akan dihapus secara
              permanen dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => {
                onDeleteMany();
                setDeleteDialogOpen(false);
              }}
            >
              {isDeleting ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
