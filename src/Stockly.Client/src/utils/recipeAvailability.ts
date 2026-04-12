import { getExpiryStatus } from './expiryStatus'
import type { Recipe } from '../models/RecipeModel'
import type { StockUnitDetail } from '../models/StockUnitModel'

export interface RecipeAvailability {
    availableProductIds: string[]
    missingProductIds: string[]
    isFullyAvailable: boolean
}

export function isProductAvailable(productId: string, allUnits: StockUnitDetail[]): boolean {
    return allUnits.some(
        u =>
            u.productId === productId &&
            u.consumedAt === null &&
            getExpiryStatus(u.expirationDate) !== 'expired'
    )
}

export function getRecipeAvailability(recipe: Recipe, allUnits: StockUnitDetail[]): RecipeAvailability {
    const availableProductIds: string[] = []
    const missingProductIds: string[] = []

    recipe.products.forEach(product => {
        if (isProductAvailable(product.id, allUnits)) {
            availableProductIds.push(product.id)
        } else {
            missingProductIds.push(product.id)
        }
    })

    return {
        availableProductIds,
        missingProductIds,
        isFullyAvailable: missingProductIds.length === 0 && recipe.products.length > 0,
    }
}
