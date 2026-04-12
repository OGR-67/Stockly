import type { Product } from "./ProductModel";

export type RecipeType = "main" | "dessert";

export interface Recipe {
  id: string;
  name: string;
  type: RecipeType;
  freeText?: string;
  productCount: number;
}

export interface RecipeDetail extends Omit<Recipe, "productCount"> {
  products: Product[];
}
