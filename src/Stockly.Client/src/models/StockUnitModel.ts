import type { ProductDetail } from "./ProductModel";
import type { StorageLocation } from "./StorageLocationModel";

export interface StockUnit {
  id: string;
  productId: string;
  locationId: string;
  expirationDate: Date | null;
  isOpened: boolean;
  freeText: string | null;
  createdAt: Date;
  openedAt: Date | null;
  consumedAt: Date | null;
}

export interface StockUnitDetail extends StockUnit {
  product: ProductDetail;
  location: StorageLocation;
}
