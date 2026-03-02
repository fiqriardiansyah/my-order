import type { ZoneRecord, TableInput } from "../interfaces/tables.interface";

// Stub — implement these when the NestJS API is ready.
// Each function should call the corresponding REST endpoint instead.

export async function createTableZones(
  _restaurantId: string,
  _zoneNames: string[]
): Promise<ZoneRecord[]> {
  throw new Error("API tables service: not implemented");
}

export async function createTables(
  _restaurantId: string,
  _tables: TableInput[]
): Promise<void> {
  throw new Error("API tables service: not implemented");
}
