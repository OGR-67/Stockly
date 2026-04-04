import { v4 as uuidv4 } from 'uuid'
import type { IProductService } from '../interfaces/IProductService'
import type { ICategoryService } from '../interfaces/ICategoryService'
import type { Barcode } from '../../models/barcodeModel'
import type { Product, ProductDetail } from '../../models/productModel'

const mockBarcodes: Barcode[] = [
    { code: '3017620422003', productId: '1' },
    { code: '7613035898226', productId: '2' },
]

const mockProducts: Product[] = [
    { id: '1', categoryId: 'cat-epicerie', name: 'Nutella', freeText: null },
    { id: '2', categoryId: 'cat-charcuterie', name: 'Jambon blanc', freeText: null },
    { id: '3', categoryId: 'cat-prep-maison', name: 'Soupe maison', freeText: '15 min à feu doux' },
]

export class MockProductService implements IProductService {
    private products: Product[] = [...mockProducts]
    private barcodes: Barcode[] = [...mockBarcodes]
    private categoryService: ICategoryService

    constructor(categoryService: ICategoryService) {
        this.categoryService = categoryService
    }

    private async toDetail(product: Product): Promise<ProductDetail> {
        const category = await this.categoryService.getById(product.categoryId)
        return {
            ...product,
            category: category!,
            barcodes: this.barcodes.filter(b => b.productId === product.id),
        }
    }

    async getAll(): Promise<ProductDetail[]> {
        return Promise.all(this.products.map(p => this.toDetail(p)))
    }

    async getById(id: string): Promise<ProductDetail | null> {
        const product = this.products.find(p => p.id === id)
        return product ? this.toDetail(product) : null
    }

    async getByBarcode(barcode: string): Promise<ProductDetail | null> {
        const b = this.barcodes.find(b => b.code === barcode)
        if (!b) return null
        return this.getById(b.productId)
    }

    async create(product: Omit<Product, 'id'>): Promise<Product> {
        const newProduct: Product = { id: uuidv4(), ...product }
        this.products.push(newProduct)
        return newProduct
    }

    async update(id: string, product: Omit<Product, 'id'>): Promise<Product> {
        const index = this.products.findIndex(p => p.id === id)
        if (index === -1) throw new Error(`Product ${id} not found`)
        this.products[index] = { id, ...product }
        return this.products[index]
    }

    async delete(id: string): Promise<void> {
        this.products = this.products.filter(p => p.id !== id)
        this.barcodes = this.barcodes.filter(b => b.productId !== id)
    }

    async addBarcode(productId: string, barcode: string): Promise<void> {
        this.barcodes.push({ code: barcode, productId })
    }

    async deleteBarcode(barcode: string): Promise<void> {
        this.barcodes = this.barcodes.filter(b => b.code !== barcode)
    }
}
