import type { ProductDetail } from '../models/ProductModel'
import type { StorageLocation } from '../models/StorageLocationModel'

export function toInputDate(date: Date): string {
    return date.toISOString().split('T')[0]
}

export function addDays(days: number): Date {
    return new Date(Date.now() + days * 86400000)
}

/**
 * DLC suggérée selon la catégorie du produit et le type d'emplacement -- notamment
 * `defaultFrozenDays` pour un congélateur, bien plus long que les durées frigo/placard.
 * Retourne '' si le produit n'est pas périssable (pas de DLC à suggérer).
 */
export function computeSuggestedDlc(product: ProductDetail, location: StorageLocation): string {
    const { category } = product
    if (!category.isPerishable) return ''
    const days = location.type === 'freezer'
        ? category.defaultFrozenDays
        : (category.defaultClosedDays ?? category.defaultOpenedDays)
    return toInputDate(addDays(days ?? 0))
}
