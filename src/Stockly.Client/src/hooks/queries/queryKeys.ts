export const queryKeys = {
    locations: ['locations'] as const,
    location: (id: string) => ['locations', id] as const,
    products: ['products'] as const,
    stockUnits: (locationId: string) => ['stockUnits', locationId] as const,
    allStockUnits: ['stockUnits', 'all'] as const,
    categories: ['categories'] as const,
    recipes: ['recipes'] as const,
}
