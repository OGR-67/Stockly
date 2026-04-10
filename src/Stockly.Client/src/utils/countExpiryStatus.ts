import { getExpiryStatus } from "./expiryStatus";
import type { StockUnitDetail } from "../models/StockUnitModel";

export interface ExpiryStatusCounts {
  expired: number;
  soon: number;
}

export function countExpiryStatus(
  units: StockUnitDetail[],
): ExpiryStatusCounts {
  return {
    expired: units.filter(
      (u) => getExpiryStatus(u.expirationDate) === "expired",
    ).length,
    soon: units.filter((u) => getExpiryStatus(u.expirationDate) === "soon")
      .length,
  };
}
