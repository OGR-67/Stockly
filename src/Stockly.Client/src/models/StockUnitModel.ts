import type { ProductDetail } from "./productModel"
import type { StorageLocation } from "./StorageLocationModel"

export interface StockUnit {
    id: string
    productId: string
    locationId: string
    expirationDate: Date | null
    isOpened: boolean
    createdAt: Date
    openedAt: Date | null
    consumedAt: Date | null
}

export interface StockUnitDetail extends StockUnit {
    product: ProductDetail
    location: StorageLocation
}
