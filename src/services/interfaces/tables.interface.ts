export interface ZoneRecord {
  id: string;
  name: string;
}

export interface TableInput {
  name: string;
  slug: string;
  sort_order: number;
  zone_id: string | null;
}

export interface ITablesService {
  createTableZones(
    restaurantId: string,
    zoneNames: string[]
  ): Promise<ZoneRecord[]>;
  createTables(restaurantId: string, tables: TableInput[]): Promise<void>;
}
