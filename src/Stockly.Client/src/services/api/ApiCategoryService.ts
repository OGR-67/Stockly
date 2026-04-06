import type { Category } from '../../models/CategoryModel'
import type { ICategoryService } from '../interfaces/ICategoryService'
import { apiClient } from './apiClient'

export class ApiCategoryService implements ICategoryService {
    async getAll(): Promise<Category[]> {
        return apiClient.get('/api/categories')
    }

    async getById(id: string): Promise<Category | null> {
        try {
            return await apiClient.get(`/api/categories/${id}`)
        } catch (e: unknown) {
            if ((e as { status?: number }).status === 404) return null
            throw e
        }
    }

    async create(category: Omit<Category, 'id'>): Promise<Category> {
        return apiClient.post('/api/categories', category)
    }

    async update(id: string, category: Omit<Category, 'id'>): Promise<Category> {
        return apiClient.put(`/api/categories/${id}`, category)
    }

    async delete(id: string): Promise<void> {
        return apiClient.del(`/api/categories/${id}`)
    }
}
