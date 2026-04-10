import type { StockUnitDetail } from "../models/StockUnitModel";

export interface StockGroup {
  key: string;
  units: StockUnitDetail[];
}

export function sortByExpiryDate(units: StockUnitDetail[]): StockUnitDetail[] {
  return [...units].sort((a, b) => {
    if (!a.expirationDate && !b.expirationDate) return 0;
    if (!a.expirationDate) return 1;
    if (!b.expirationDate) return -1;

    return (
      new Date(a.expirationDate).getTime() -
      new Date(b.expirationDate).getTime()
    );
  });
}

export function sortGroupsByExpiryDate(groups: StockGroup[]): StockGroup[] {
  return [...groups].sort((a, b) => {
    const aDate = a.units[0].expirationDate;
    const bDate = b.units[0].expirationDate;

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
}
