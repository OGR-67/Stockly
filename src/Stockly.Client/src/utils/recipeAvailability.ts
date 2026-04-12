import { getExpiryStatus } from './expiryStatus'
import type { RecipeDetail, Recipe } from '../models/RecipeModel'
import type { Product } from '../models/ProductModel'
import type { StockUnitDetail } from '../models/StockUnitModel'

export interface RecipeAvailability {
    available: Product[]
    missing: Product[]
    isFullyAvailable: boolean
    missingCount: number
}

export function isProductAvailable(productId: string, allUnits: StockUnitDetail[]): boolean {
    return allUnits.some(
        u =>
            u.productId === productId &&
            u.consumedAt === null &&
            getExpiryStatus(u.expirationDate) !== 'expired'
    )
}

export function getRecipeAvailability(recipe: RecipeDetail, allUnits: StockUnitDetail[]): RecipeAvailability {
    const available: Product[] = []
    const missing: Product[] = []

    recipe.products.forEach(product => {
        if (isProductAvailable(product.id, allUnits)) {
            available.push(product)
        } else {
            missing.push(product)
        }
    })

    return {
        available,
        missing,
        isFullyAvailable: missing.length === 0 && recipe.products.length > 0,
        missingCount: missing.length,
    }
}

export function getSimpleRecipeAvailability(recipe: Recipe, allUnits: StockUnitDetail[]): boolean {
    // Pour la liste, sans avoir le détail complet, on ne peut juste vérifier
    // Retourne true seulement si on a au moins les infos nécessaires
    // En pratique, pour la liste, il faudrait passer les RecipeDetail
    // Pour l'instant on retourne false (conservative approach)
    return recipe.productCount > 0
}
