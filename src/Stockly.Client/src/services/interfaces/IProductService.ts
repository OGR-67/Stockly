import type { Product, ProductDetail } from "../../models/ProductModel"

export interface IProductService {
    getAll(): Promise<ProductDetail[]>
    getById(id: string): Promise<ProductDetail | null>
    getByBarcode(barcode: string): Promise<ProductDetail | null>
    create(product: Omit<Product, 'id'>): Promise<Product>
    update(id: string, product: Omit<Product, 'id'>): Promise<Product>
    delete(id: string): Promise<void>
    addBarcode(productId: string, barcode: string): Promise<void>
    deleteBarcode(barcode: string): Promise<void>
}
