import type { Barcode } from "./BarcodeModel"
import type { Category } from "./CategoryModel"

export interface Product {
    id: string
    categoryId: string
    name: string
    freeText: string | null
}

export interface ProductDetail extends Product {
    category: Category
    barcodes: Barcode[]
}
