import { apiClient } from './apiClient'
import type { IRecipeService } from '../interfaces/IRecipeService'
import type { Recipe, RecipeDetail } from '../../models/RecipeModel'

export class ApiRecipeService implements IRecipeService {
    async getAll(): Promise<Recipe[]> {
        return apiClient.get('/api/recipes')
    }

    async getById(id: string): Promise<RecipeDetail> {
        return apiClient.get(`/api/recipes/${id}`)
    }

    async create(name: string, type: 'Main' | 'Dessert', freeText: string | undefined, productIds: string[]): Promise<Recipe> {
        return apiClient.post('/api/recipes', { name, type, freeText, productIds })
    }

    async update(id: string, name: string, type: 'Main' | 'Dessert', freeText: string | undefined, productIds: string[]): Promise<Recipe> {
        return apiClient.put(`/api/recipes/${id}`, { name, type, freeText, productIds })
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/recipes/${id}`)
    }
}
