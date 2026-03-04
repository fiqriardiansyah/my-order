import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectMenu } from "@/components/select-menu";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";
import { useMenus } from "@/hooks/api/use-menus";
import { useMenuCategories } from "@/hooks/api/use-menu-categories";
import type { MenuItemRow, StatusFilter } from "@/@types/menu";
import {
  useDeleteMenuItem,
  useMenuItems,
  useToggleMenuItemAvailability,
} from "@/hooks/api/use-menu-items";
import { CountBadge } from "@/modules/menu/components/count-badge";
import { DeleteDialog } from "@/modules/menu/components/delete-dialog";
import { EditItemDialog } from "@/modules/menu/components/edit-item-dialog";
import { ItemImage } from "@/modules/menu/components/item-image";
import { TableSkeleton } from "@/modules/menu/components/table-skeleton";
import {
  categoryColor,
  formatRupiah,
  PAGE_SIZE_OPTIONS,
} from "@/modules/menu/utils";

export default function MenuPage() {
  const navigate = useNavigate();
  const { data: onboarding } = useOnboardingStatus();
  const restaurantId = onboarding?.restaurantId;

  // filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [menuIds, setMenuIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // edit / delete dialog
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItemRow | null>(null);

  // debounce search input → reset to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: menus = [], isLoading: menusLoading } = useMenus(restaurantId);
  const activeMenuIds = menusLoading
    ? null
    : menus.filter((m) => m.is_active).map((m) => m.id);

  const { data, isLoading } = useMenuItems({
    restaurantId,
    menuIds,
    search,
    categoryIds,
    status,
    page,
    pageSize,
    activeMenuIds,
  });
  const { data: categories = [] } = useMenuCategories(
    restaurantId,
    menuIds.length > 0 ? menuIds : activeMenuIds,
  );
  const toggleMutation = useToggleMenuItemAvailability();
  const deleteMutation = useDeleteMenuItem();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, total);

  function handleMenuChange(values: string[]) {
    setMenuIds(values);
    setCategoryIds([]);
    setPage(1);
  }

  function handleCategoryChange(values: string[]) {
    setCategoryIds(values);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value as StatusFilter);
    setPage(1);
  }

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  // show up to 5 page numbers around the current page
  function pageNumbers() {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      {/* heading */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <Button onClick={() => navigate("/menu/add")}>
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari menu, deskripsi, atau kategori..."
            className="pl-9"
          />
        </div>

        <SelectMenu
          multiple
          options={menus.map((m) => ({
            value: m.id,
            label: m.name,
            meta: !m.is_active ? "Inactive" : m.is_default ? "Default" : undefined,
            disabled: !m.is_active,
          }))}
          value={menuIds}
          onValueChange={handleMenuChange}
          placeholder="Semua Menu"
          searchPlaceholder="Cari menu..."
          className="min-w-36"
        />

        <SelectMenu
          multiple
          options={categories.map((c) => ({
            value: c.id,
            label: c.name,
            meta: !c.is_visible ? "Inactive" : undefined,
            disabled: !c.is_visible,
          }))}
          value={categoryIds}
          onValueChange={handleCategoryChange}
          placeholder="Semua Kategori"
          searchPlaceholder="Cari kategori..."
          className="min-w-40"
        />

        <Tabs value={status} onValueChange={handleStatusChange}>
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="available">Tersedia</TabsTrigger>
            <TabsTrigger value="unavailable">Habis</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-75">Nama &amp; Deskripsi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga Dasar</TableHead>
              <TableHead>Varian</TableHead>
              <TableHead>Modifier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={pageSize} />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-16 text-center"
                >
                  Tidak ada menu item ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ItemImage url={item.image_url} name={item.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-muted-foreground max-w-56 truncate text-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {item.category ? (
                      <Badge
                        variant="outline"
                        className={categoryColor(item.category.id)}
                      >
                        <span>{item.category.name.toUpperCase()}</span>
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">–</span>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {formatRupiah(item.base_price)}
                  </TableCell>

                  <TableCell>
                    <CountBadge
                      count={item.variant_count}
                      label="Varian"
                      colorClass="bg-secondary text-secondary-foreground border-transparent"
                    />
                  </TableCell>

                  <TableCell>
                    <CountBadge
                      count={item.modifier_count}
                      label="Modifiers"
                      colorClass="bg-primary/10 text-primary border-transparent"
                    />
                  </TableCell>

                  <TableCell>
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({
                          id: item.id,
                          is_available: checked,
                        })
                      }
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Edit"
                        onClick={() => setEditTargetId(item.id)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive size-7"
                        aria-label="Hapus"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* footer: count info + page size + pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Menampilkan {rangeFrom}–{rangeTo} dari {total} items
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Baris per halaman:
            </span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border-input bg-background text-foreground focus:ring-ring h-8 rounded-md border px-2 text-sm focus:ring-1 focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Halaman sebelumnya"
            >
              ‹
            </Button>

            {pageNumbers().map((n) => (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="icon"
                className="size-8 text-sm"
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Halaman berikutnya"
            >
              ›
            </Button>
          </div>
        </div>
      </div>

      <EditItemDialog
        itemId={editTargetId}
        restaurantId={restaurantId}
        onClose={() => setEditTargetId(null)}
      />

      <DeleteDialog
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
