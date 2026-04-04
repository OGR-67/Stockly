import type { Barcode } from "./barcodeModel"
import type { Category } from "./categoryModel"

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
