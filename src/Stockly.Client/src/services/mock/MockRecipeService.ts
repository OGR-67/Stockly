import type { IRecipeService } from "../interfaces/IRecipeService";
import type { Recipe, RecipeDetail } from "../../models/RecipeModel";

const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Pâtes Carbonara",
    type: "main",
    freeText: "Classique italienne",
    productCount: 5,
  },
  {
    id: "2",
    name: "Tiramisu",
    type: "dessert",
    freeText: "Dessert italien traditionnel",
    productCount: 4,
  },
];

export class MockRecipeService implements IRecipeService {
  async getAll(): Promise<Recipe[]> {
    return mockRecipes;
  }

  async getById(id: string): Promise<RecipeDetail> {
    const recipe = mockRecipes.find((r) => r.id === id);
    if (!recipe) throw new Error(`Recipe ${id} not found`);
    return {
      ...recipe,
      products: [],
    };
  }

  async create(
    name: string,
    type: "main" | "dessert",
    freeText: string | undefined,
    productIds: string[],
  ): Promise<Recipe> {
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      name,
      type,
      freeText,
      productCount: productIds.length,
    };
    mockRecipes.push(recipe);
    return recipe;
  }

  async update(
    id: string,
    name: string,
    type: "main" | "dessert",
    freeText: string | undefined,
    productIds: string[],
  ): Promise<Recipe> {
    const recipe = mockRecipes.find((r) => r.id === id);
    if (!recipe) throw new Error(`Recipe ${id} not found`);
    recipe.name = name;
    recipe.type = type;
    recipe.freeText = freeText;
    recipe.productCount = productIds.length;
    return recipe;
  }

  async delete(id: string): Promise<void> {
    const idx = mockRecipes.findIndex((r) => r.id === id);
    if (idx >= 0) mockRecipes.splice(idx, 1);
  }
}
