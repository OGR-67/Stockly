import type { Recipe, RecipeDetail } from '../../models/RecipeModel'

export interface IRecipeService {
    getAll(): Promise<Recipe[]>
    getById(id: string): Promise<RecipeDetail>
    create(name: string, type: 'Main' | 'Dessert', freeText: string | undefined, productIds: string[]): Promise<Recipe>
    update(id: string, name: string, type: 'Main' | 'Dessert', freeText: string | undefined, productIds: string[]): Promise<Recipe>
    delete(id: string): Promise<void>
}
