import type { StockUnit, StockUnitDetail } from "../../models/StockUnitModel";
import type { IStockUnitService } from "../interfaces/IStockUnitService";
import { apiClient, toDate } from "./apiClient";

type RawStockUnitDetail = Omit<
  StockUnitDetail,
  "expirationDate" | "createdAt" | "openedAt" | "consumedAt"
> & {
  expirationDate: string | null;
  createdAt: string;
  openedAt: string | null;
  consumedAt: string | null;
};

function parseStockUnit(raw: RawStockUnitDetail): StockUnitDetail {
  return {
    ...raw,
    expirationDate: toDate(raw.expirationDate),
    createdAt: new Date(raw.createdAt),
    openedAt: toDate(raw.openedAt),
    consumedAt: toDate(raw.consumedAt),
  };
}

export class ApiStockUnitService implements IStockUnitService {
  async getAll(): Promise<StockUnitDetail[]> {
    const raw = await apiClient.get<RawStockUnitDetail[]>("/api/stock-units");
    return raw.map(parseStockUnit);
  }

  async getByLocation(locationId: string): Promise<StockUnitDetail[]> {
    const raw = await apiClient.get<RawStockUnitDetail[]>(
      `/api/stock-units/location/${locationId}`,
    );
    return raw.map(parseStockUnit);
  }

  async add(
    stockUnit: Omit<
      StockUnit,
      "id" | "createdAt" | "isOpened" | "openedAt" | "consumedAt"
    >,
  ): Promise<StockUnit> {
    return apiClient.post("/api/stock-units", {
      productId: stockUnit.productId,
      locationId: stockUnit.locationId,
      expirationDate: stockUnit.expirationDate?.toISOString() ?? null,
      freeText: stockUnit.freeText ?? null,
    });
  }

  async update(id: string, data: { expirationDate: Date | null; freeText: string | null }): Promise<StockUnit> {
    return apiClient.patch(`/api/stock-units/${id}`, {
      expirationDate: data.expirationDate?.toISOString() ?? null,
      freeText: data.freeText,
    });
  }

  async open(id: string): Promise<StockUnit> {
    return apiClient.put(`/api/stock-units/${id}/open`, {});
  }

  async move(id: string, locationId: string): Promise<StockUnit> {
    return apiClient.put(`/api/stock-units/${id}/move`, { locationId });
  }

  async consume(id: string): Promise<StockUnit> {
    return apiClient.put(`/api/stock-units/${id}/consume`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.del(`/api/stock-units/${id}`);
  }
}
