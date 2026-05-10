import type { Barcode } from "./BarcodeModel";
import type { Category } from "./CategoryModel";

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  freeText: string | null;
  minStockUnits: number | null;
}

export interface ProductDetail extends Product {
  category: Category;
  barcodes: Barcode[];
}
