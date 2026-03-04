import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCreateMenuItem } from "@/hooks/api/use-menu-items";
import { AddMenuItemForm } from "@/modules/menu/components/add-menu-item-form";
import type { MenuItemFormValues } from "@/modules/menu/schemas/menu-item.schema";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";

// ─── types ────────────────────────────────────────────────────────────────────

type QueueEntry = MenuItemFormValues & {
  _id: string;
  _categoryName: string;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

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

  const { mutateAsync: createMenuItem } = useCreateMenuItem();

  function addToQueue(values: MenuItemFormValues, categoryName: string) {
    setQueue((prev) => [
      ...prev,
      { ...values, _id: crypto.randomUUID(), _categoryName: categoryName },
    ]);
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

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-5 p-5">
      {/* ── header ── */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold leading-tight">Tambah Item Menu</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="add-item-form"
            variant="outline"
            disabled={isSaving || !restaurantId}
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
      <AddMenuItemForm
        formId="add-item-form"
        restaurantId={restaurantId}
        onSubmit={addToQueue}
        disabled={isSaving}
      >
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
      </AddMenuItemForm>
    </div>
  );
}
