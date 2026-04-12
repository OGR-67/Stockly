import { apiClient } from "./apiClient";
import type { IRecipeService } from "../interfaces/IRecipeService";
import type { Recipe } from "../../models/RecipeModel";

export class ApiRecipeService implements IRecipeService {
  async getAll(): Promise<Recipe[]> {
    return apiClient.get("/api/recipes");
  }

  async create(
    name: string,
    type: "main" | "dessert",
    freeText: string | undefined,
    productIds: string[],
  ): Promise<Recipe> {
    return apiClient.post("/api/recipes", { name, type, freeText, productIds });
  }

  async update(
    id: string,
    name: string,
    type: "main" | "dessert",
    freeText: string | undefined,
    productIds: string[],
  ): Promise<Recipe> {
    return apiClient.put(`/api/recipes/${id}`, {
      name,
      type,
      freeText,
      productIds,
    });
  }

  async delete(id: string): Promise<void> {
    await apiClient.del(`/api/recipes/${id}`);
  }
}
