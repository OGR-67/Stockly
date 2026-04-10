import type { StockUnitDetail } from "../models/StockUnitModel";
import { sortGroupsByExpiryDate, type StockGroup } from "./sortByExpiry";

export function groupUnits(units: StockUnitDetail[]): StockGroup[] {
  const map = new Map<string, StockUnitDetail[]>();
  for (const unit of units) {
    const dateStr = unit.expirationDate
      ? new Date(unit.expirationDate).toDateString()
      : "null";
    const key = `${unit.productId}__${dateStr}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(unit);
  }

  const groups = [...map.entries()].map(([key, units]) => ({ key, units }));
  return sortGroupsByExpiryDate(groups);
}
