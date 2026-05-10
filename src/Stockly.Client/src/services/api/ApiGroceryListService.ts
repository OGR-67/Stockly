import { apiClient } from "./apiClient";
import type { GroceryList } from "../../models/GroceryListModel";

export class ApiGroceryListService {
    async getCurrent(): Promise<GroceryList | null> {
        try {
            return await apiClient.get("/api/grocery-list/current");
        } catch (e) {
            if ((e as { status?: number }).status === 404) return null;
            throw e;
        }
    }

    async generate(recipeIds: string[], manualProductIds: string[]): Promise<GroceryList> {
        return apiClient.post("/api/grocery-list/generate", { recipeIds, manualProductIds });
    }

    async removeItem(itemId: string): Promise<void> {
        return apiClient.del(`/api/grocery-list/items/${itemId}`);
    }

    async clear(): Promise<void> {
        return apiClient.del('/api/grocery-list');
    }
}
