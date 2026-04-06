import type { Product, ProductDetail } from '../../models/ProductModel'
import type { IProductService } from '../interfaces/IProductService'
import { apiClient } from './apiClient'

export class ApiProductService implements IProductService {
    async getAll(): Promise<ProductDetail[]> {
        return apiClient.get('/api/products')
    }

    async getById(id: string): Promise<ProductDetail | null> {
        try {
            return await apiClient.get(`/api/products/${id}`)
        } catch (e: unknown) {
            if ((e as { status?: number }).status === 404) return null
            throw e
        }
    }

    async getByBarcode(barcode: string): Promise<ProductDetail | null> {
        try {
            return await apiClient.get(`/api/products/barcode/${encodeURIComponent(barcode)}`)
        } catch (e: unknown) {
            if ((e as { status?: number }).status === 404) return null
            throw e
        }
    }

    async create(product: Omit<Product, 'id'>): Promise<Product> {
        return apiClient.post('/api/products', product)
    }

    async update(id: string, product: Omit<Product, 'id'>): Promise<Product> {
        return apiClient.put(`/api/products/${id}`, product)
    }

    async delete(id: string): Promise<void> {
        return apiClient.del(`/api/products/${id}`)
    }

    async addBarcode(productId: string, barcode: string): Promise<void> {
        return apiClient.post(`/api/products/${productId}/barcodes`, { barcode })
    }

    async deleteBarcode(barcode: string): Promise<void> {
        return apiClient.del(`/api/products/barcodes/${encodeURIComponent(barcode)}`)
    }
}
