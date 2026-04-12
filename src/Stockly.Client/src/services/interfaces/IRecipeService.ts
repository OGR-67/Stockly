import type { Recipe } from "../../models/RecipeModel";

export interface IRecipeService {
  getAll(): Promise<Recipe[]>;
  create(
    name: string,
    type: "main" | "dessert",
    freeText: string | undefined,
    productIds: string[],
  ): Promise<Recipe>;
  update(
    id: string,
    name: string,
    type: "main" | "dessert",
    freeText: string | undefined,
    productIds: string[],
  ): Promise<Recipe>;
  delete(id: string): Promise<void>;
}
