export const CATEGORY_PALETTE = [
  "bg-blue-100 text-blue-700 border-transparent",
  "bg-emerald-100 text-emerald-700 border-transparent",
  "bg-orange-100 text-orange-700 border-transparent",
  "bg-violet-100 text-violet-700 border-transparent",
  "bg-rose-100 text-rose-700 border-transparent",
  "bg-amber-100 text-amber-700 border-transparent",
  "bg-teal-100 text-teal-700 border-transparent",
  "bg-indigo-100 text-indigo-700 border-transparent",
];

export function categoryColor(id: string) {
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50];
