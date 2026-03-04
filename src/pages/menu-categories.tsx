import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useOnboardingStatus } from "@/modules/on-boarding/hooks/use-onboarding-status";
import type {
  MenuWithCount,
  MenuCategoryDetail,
  MenuItemRow,
  StatusFilter,
} from "@/@types/menu";
import {
  useDeleteMenu,
  useMenusWithCount,
  useUpdateMenu,
} from "@/hooks/api/use-menus";
import {
  useDeleteMenuCategory,
  useMenuCategoriesDetail,
  useUpdateMenuCategory,
} from "@/hooks/api/use-menu-categories";
import {
  useBulkUpdateMenuItemAvailability,
  useCreateMenuItem,
  useDeleteManyMenuItems,
  useDeleteMenuItem,
  useMenuItems,
  useToggleMenuItemAvailability,
} from "@/hooks/api/use-menu-items";
import { AddMenuItemForm } from "@/modules/menu/components/add-menu-item-form";
import { BulkActionBar } from "@/modules/menu/components/bulk-action-bar";
import { CategoryFormDialog } from "@/modules/menu/components/category-form-dialog";
import { DeleteDialog } from "@/modules/menu/components/delete-dialog";
import { EditItemDialog } from "@/modules/menu/components/edit-item-dialog";
import { ItemImage } from "@/modules/menu/components/item-image";
import { MenuFormDialog } from "@/modules/menu/components/menu-form-dialog";
import { formatRupiah } from "@/modules/menu/utils";

// ─── color helpers ────────────────────────────────────────────────────────────

const DOT_COLORS = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-orange-400",
  "bg-violet-400",
  "bg-rose-400",
  "bg-amber-400",
  "bg-teal-400",
  "bg-indigo-400",
];

function dotColor(id: string) {
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DOT_COLORS[hash % DOT_COLORS.length];
}

// ─── MenuListItem ─────────────────────────────────────────────────────────────

function MenuListItem({
  menu,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  menu: MenuWithCount;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div
      className={cn(
        "group mx-2 mb-0.5 cursor-pointer rounded-md px-3 py-2.5 transition-colors",
        isSelected
          ? "bg-primary/10 ring-1 ring-inset ring-primary/40"
          : "hover:bg-muted/60",
        !menu.is_active && "opacity-60",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {!menu.is_active && (
              <EyeOff className="text-muted-foreground size-3 shrink-0" />
            )}
            <p
              className={cn(
                "truncate text-sm font-medium",
                isSelected && "text-primary",
              )}
            >
              {menu.name}
            </p>
          </div>
          <p className="text-muted-foreground text-xs">
            {menu.category_count} kategori
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge
            variant="outline"
            className={cn(
              "h-4 border-transparent px-1.5 text-[10px]",
              menu.is_active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground",
            )}
          >
            {menu.is_active ? "ACTIVE" : "INACTIVE"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive();
                }}
              >
                {menu.is_active ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                {menu.is_active ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="size-3.5" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryListItem ─────────────────────────────────────────────────────────

function CategoryListItem({
  category,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleVisible,
}: {
  category: MenuCategoryDetail;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
}) {
  return (
    <div
      className={cn(
        "group mx-2 mb-0.5 cursor-pointer rounded-md px-3 py-2.5 transition-colors",
        isSelected
          ? "bg-primary/10 ring-1 ring-inset ring-primary/40"
          : "hover:bg-muted/60",
        !category.is_visible && "opacity-60",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2.5">
        {/* leading visual: image or dot, with EyeOff overlay when hidden */}
        <div className="relative shrink-0">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn("size-2.5 rounded-full", dotColor(category.id))}
            />
          )}
          {!category.is_visible && (
            <EyeOff className="text-muted-foreground absolute -top-1 -right-1 size-3" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              isSelected && "text-primary",
            )}
          >
            {category.name}
          </p>
          {category.description && (
            <p className="text-muted-foreground truncate text-xs">
              {category.description}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            {category.item_count} item
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisible();
                }}
              >
                {category.is_visible ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                {category.is_visible ? "Sembunyikan" : "Tampilkan"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="size-3.5" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ─── ItemRow ──────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  isSelected,
  onSelectChange,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItemRow;
  isSelected: boolean;
  onSelectChange: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b px-5 py-3 last:border-b-0">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelectChange}
        aria-label={`Pilih ${item.name}`}
      />
      <ItemImage url={item.image_url} name={item.name} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        {item.description && (
          <p className="text-muted-foreground truncate text-xs">
            {item.description}
          </p>
        )}
      </div>

      <span className="text-muted-foreground w-24 shrink-0 text-right text-sm font-medium">
        {formatRupiah(item.base_price)}
      </span>

      <div className="flex w-28 shrink-0 items-center gap-2">
        <Switch checked={item.is_available} onCheckedChange={onToggle} />
        <span
          className={cn(
            "text-xs",
            item.is_available ? "text-emerald-600" : "text-muted-foreground",
          )}
        >
          {item.is_available ? "Available" : "Sold Out"}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Edit"
          onClick={onEdit}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive size-7"
          aria-label="Hapus"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── ItemsPanel ───────────────────────────────────────────────────────────────

function ItemsPanel({
  restaurantId,
  menuId,
  categoryId,
  categoryName,
}: {
  restaurantId: string;
  menuId: string;
  categoryId: string;
  categoryName: string;
}) {
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [itemDeleteTarget, setItemDeleteTarget] = useState<MenuItemRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const createMutation = useCreateMenuItem();
  const toggleMutation = useToggleMenuItemAvailability();
  const deleteMutation = useDeleteMenuItem();
  const deleteManyMutation = useDeleteManyMenuItems();
  const bulkUpdateMutation = useBulkUpdateMenuItemAvailability();

  const { data, isLoading } = useMenuItems({
    restaurantId,
    menuIds: [],
    search,
    categoryIds: [categoryId],
    status,
    page: 1,
    pageSize: 100,
    activeMenuIds: [],
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setSelectedIds(new Set());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someSelected = items.some((i) => selectedIds.has(i.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div>
          <h2 className="font-semibold">{categoryName}</h2>
          <p className="text-muted-foreground text-xs">
            {total} item dalam kategori ini
          </p>
        </div>
        <Button size="sm" onClick={() => setAddItemOpen(true)}>
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-3 border-b px-5 py-2.5">
        <Checkbox
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={toggleSelectAll}
          disabled={isLoading || items.length === 0}
          aria-label="Pilih semua"
        />
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari item..."
            className="h-8 pl-9"
          />
        </div>
        <Tabs
          value={status}
          onValueChange={(v) => { setStatus(v as StatusFilter); setSelectedIds(new Set()); }}
        >
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="available" className="text-xs">
              Available
            </TabsTrigger>
            <TabsTrigger value="unavailable" className="text-xs">
              Unavailable
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="border-b px-5 py-2">
          <BulkActionBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteMany={() =>
              deleteManyMutation.mutate(Array.from(selectedIds), {
                onSuccess: () => setSelectedIds(new Set()),
              })
            }
            onMarkAvailable={() =>
              bulkUpdateMutation.mutate(
                { ids: Array.from(selectedIds), is_available: true },
                { onSuccess: () => setSelectedIds(new Set()) },
              )
            }
            onMarkUnavailable={() =>
              bulkUpdateMutation.mutate(
                { ids: Array.from(selectedIds), is_available: false },
                { onSuccess: () => setSelectedIds(new Set()) },
              )
            }
            isDeleting={deleteManyMutation.isPending}
            isUpdating={bulkUpdateMutation.isPending}
          />
        </div>
      )}

      {/* items list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b px-5 py-3"
              >
                <div className="bg-muted size-4 shrink-0 animate-pulse rounded" />
                <div className="bg-muted size-10 shrink-0 animate-pulse rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <div className="bg-muted h-4 w-40 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
            Tidak ada item ditemukan.
          </div>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              onSelectChange={() => toggleSelectItem(item.id)}
              onEdit={() => setEditTargetId(item.id)}
              onDelete={() => setItemDeleteTarget(item)}
              onToggle={(checked) =>
                toggleMutation.mutate({ id: item.id, is_available: checked })
              }
            />
          ))
        )}
      </div>

      <EditItemDialog
        itemId={editTargetId}
        restaurantId={restaurantId}
        onClose={() => setEditTargetId(null)}
      />
      <DeleteDialog
        item={itemDeleteTarget}
        onClose={() => setItemDeleteTarget(null)}
        onConfirm={() => {
          if (!itemDeleteTarget) return;
          deleteMutation.mutate(itemDeleteTarget.id, {
            onSuccess: () => setItemDeleteTarget(null),
          });
        }}
        isPending={deleteMutation.isPending}
      />

      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="flex max-h-[85vh] sm:max-w-5xl flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <AddMenuItemForm
              restaurantId={restaurantId}
              formId="add-item-modal-form"
              sidebarSide="right"
              defaultValues={{ menu_id: menuId, category_id: categoryId }}
              disabled={createMutation.isPending}
              onSubmit={(values) => {
                createMutation.mutate(
                  { restaurantId, values },
                  { onSuccess: () => setAddItemOpen(false) },
                );
              }}
            />
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setAddItemOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-item-modal-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuCategoriesPage() {
  const { data: onboarding } = useOnboardingStatus();
  const restaurantId = onboarding?.restaurantId;

  // null = "auto" (first menu); explicit id = user-chosen
  const [_selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // menu dialog
  const [menuDialog, setMenuDialog] = useState<{
    open: boolean;
    menu?: MenuWithCount;
  }>({ open: false });

  // category dialog
  const [catDialog, setCatDialog] = useState<{
    open: boolean;
    category?: MenuCategoryDetail;
  }>({ open: false });

  // delete targets
  const [menuDeleteTarget, setMenuDeleteTarget] =
    useState<MenuWithCount | null>(null);
  const [catDeleteTarget, setCatDeleteTarget] =
    useState<MenuCategoryDetail | null>(null);

  const deleteMenuMutation = useDeleteMenu();
  const deleteCatMutation = useDeleteMenuCategory();
  const updateMenuMutation = useUpdateMenu();
  const updateCatMutation = useUpdateMenuCategory();

  const { data: menus = [], isLoading: menusLoading } =
    useMenusWithCount(restaurantId);

  // derive: fall back to first menu when nothing explicitly chosen
  const selectedMenuId = _selectedMenuId ?? menus[0]?.id ?? null;

  const { data: categories = [], isLoading: catsLoading } =
    useMenuCategoriesDetail(restaurantId, selectedMenuId);

  function handleMenuSelect(id: string) {
    setSelectedMenuId(id);
    setSelectedCategoryId(null);
  }

  const selectedMenu = menus.find((m) => m.id === selectedMenuId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const panelRef = useRef<HTMLDivElement>(null);
  const [panelTop, setPanelTop] = useState(0);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () => setPanelTop(el.getBoundingClientRect().top);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="">
      <div className="p-5">
        <h1 className="text-xl font-bold leading-tight">
          Menu Kategori Manager
        </h1>
      </div>
      <div
        ref={panelRef}
        className="flex overflow-hidden"
        style={{ height: `calc(100vh - ${panelTop}px)` }}
      >
        {/* ── Left: Menus ────────────────────────────── */}
        <div className="flex w-[25%] shrink-0 flex-col border-r">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Menus</span>
              {menus.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 rounded-full px-1.5 text-xs"
                >
                  {menus.length}
                </Badge>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => setMenuDialog({ open: true })}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {menusLoading ? (
              <div className="space-y-1.5 px-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-14 animate-pulse rounded-md"
                  />
                ))}
              </div>
            ) : menus.length === 0 ? (
              <p className="text-muted-foreground px-4 py-6 text-center text-xs">
                Belum ada menu.
              </p>
            ) : (
              menus.map((menu) => (
                <MenuListItem
                  key={menu.id}
                  menu={menu}
                  isSelected={menu.id === selectedMenuId}
                  onSelect={() => handleMenuSelect(menu.id)}
                  onEdit={() => setMenuDialog({ open: true, menu })}
                  onDelete={() => setMenuDeleteTarget(menu)}
                  onToggleActive={() =>
                    updateMenuMutation.mutate({
                      id: menu.id,
                      name: menu.name,
                      is_active: !menu.is_active,
                    })
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* ── Middle: Categories ──────────────────────── */}
        <div className="flex w-[25%] shrink-0 flex-col border-r">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Categories</span>
              {selectedMenuId && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() => setCatDialog({ open: true })}
                >
                  <Plus className="size-4" />
                </Button>
              )}
            </div>
            {selectedMenu && (
              <p className="text-muted-foreground mt-0.5 text-xs">
                {selectedMenu.name} &bull; {selectedMenu.category_count}{" "}
                Kategori
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {!selectedMenuId ? (
              <p className="text-muted-foreground px-4 py-6 text-center text-xs">
                Pilih menu terlebih dahulu.
              </p>
            ) : catsLoading ? (
              <div className="space-y-1.5 px-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-14 animate-pulse rounded-md"
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-muted-foreground px-4 py-6 text-center text-xs">
                Belum ada kategori.
              </p>
            ) : (
              categories.map((cat) => (
                <CategoryListItem
                  key={cat.id}
                  category={cat}
                  isSelected={cat.id === selectedCategoryId}
                  onSelect={() => setSelectedCategoryId(cat.id)}
                  onEdit={() => setCatDialog({ open: true, category: cat })}
                  onDelete={() => setCatDeleteTarget(cat)}
                  onToggleVisible={() =>
                    updateCatMutation.mutate({
                      id: cat.id,
                      name: cat.name,
                      description: cat.description ?? undefined,
                      is_visible: !cat.is_visible,
                    })
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: Items ─────────────────────────────── */}
        {selectedCategoryId && restaurantId ? (
          <ItemsPanel
            key={selectedCategoryId}
            restaurantId={restaurantId}
            menuId={selectedMenuId ?? ""}
            categoryId={selectedCategoryId}
            categoryName={selectedCategory?.name ?? ""}
          />
        ) : (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            {selectedMenuId
              ? "Pilih kategori untuk melihat item."
              : "Pilih menu lalu kategori."}
          </div>
        )}

        {/* ── Dialogs ──────────────────────────────────── */}
        {restaurantId && (
          <>
            <MenuFormDialog
              open={menuDialog.open}
              onClose={() => setMenuDialog({ open: false })}
              restaurantId={restaurantId}
              menu={menuDialog.menu}
            />

            {selectedMenuId && (
              <CategoryFormDialog
                open={catDialog.open}
                onClose={() => setCatDialog({ open: false })}
                restaurantId={restaurantId}
                menuId={selectedMenuId}
                category={catDialog.category}
              />
            )}

            {/* Delete menu confirmation */}
            <Dialog
              open={!!menuDeleteTarget}
              onOpenChange={(o) => !o && setMenuDeleteTarget(null)}
            >
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Hapus menu?</DialogTitle>
                  <DialogDescription>
                    <strong>{menuDeleteTarget?.name}</strong> akan dihapus.
                    Kategori dan item di dalamnya tidak akan ikut terhapus.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setMenuDeleteTarget(null)}
                    disabled={deleteMenuMutation.isPending}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteMenuMutation.isPending}
                    onClick={() => {
                      if (!menuDeleteTarget) return;
                      deleteMenuMutation.mutate(menuDeleteTarget.id, {
                        onSuccess: () => {
                          setMenuDeleteTarget(null);
                          if (selectedMenuId === menuDeleteTarget.id)
                            setSelectedMenuId(null);
                        },
                      });
                    }}
                  >
                    {deleteMenuMutation.isPending ? "Menghapus..." : "Hapus"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete category confirmation */}
            <Dialog
              open={!!catDeleteTarget}
              onOpenChange={(o) => !o && setCatDeleteTarget(null)}
            >
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Hapus kategori?</DialogTitle>
                  <DialogDescription>
                    <strong>{catDeleteTarget?.name}</strong> akan dihapus. Item
                    dalam kategori ini tidak akan ikut terhapus.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCatDeleteTarget(null)}
                    disabled={deleteCatMutation.isPending}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteCatMutation.isPending}
                    onClick={() => {
                      if (!catDeleteTarget) return;
                      deleteCatMutation.mutate(catDeleteTarget.id, {
                        onSuccess: () => {
                          setCatDeleteTarget(null);
                          if (selectedCategoryId === catDeleteTarget.id)
                            setSelectedCategoryId(null);
                        },
                      });
                    }}
                  >
                    {deleteCatMutation.isPending ? "Menghapus..." : "Hapus"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
