import type { Product } from "./ProductModel";

export type GroceryListItemSource = "minStock" | "recipe" | "manual";

export interface GroceryListItem {
    id: string;
    product: Product;
    source: GroceryListItemSource;
    recipeId: string | null;
    quantity: number | null;
}

export interface GroceryList {
    id: string;
    generatedAt: string;
    items: GroceryListItem[];
}
