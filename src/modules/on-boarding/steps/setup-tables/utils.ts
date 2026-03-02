import type { NamingStyle } from "../../schemas/setup-tables.schema";

export interface GeneratedTable {
  name: string;
  slug: string;
  sort_order: number;
  zone?: string;
}

export function generateTableName(
  index: number,
  style: NamingStyle
): { name: string; slug: string } {
  const n = index + 1;
  const pad = String(n).padStart(2, "0");

  switch (style) {
    case "numbered":
      return { name: `Table ${pad}`, slug: `table-${pad}` };
    case "short":
      return { name: `T-${pad}`, slug: `t-${pad}` };
    case "grid": {
      // A1, B1 … Z1, A2, B2 … up to 50 tables
      const letter = String.fromCharCode(65 + (index % 26)); // A–Z
      const row = Math.floor(index / 26) + 1;
      const label = `${letter}${row}`;
      return { name: label, slug: label.toLowerCase() };
    }
  }
}

export function generateTables(
  count: number,
  style: NamingStyle,
  zones: string[]
): GeneratedTable[] {
  return Array.from({ length: count }, (_, i) => {
    const { name, slug } = generateTableName(i, style);
    const zone =
      zones.length > 0 ? zones[Math.floor(i / Math.ceil(count / zones.length))] : undefined;
    return { name, slug, sort_order: i, zone };
  });
}
