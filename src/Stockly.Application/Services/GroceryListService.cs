using Stockly.Application.DTOs.GroceryList;
using Stockly.Application.DTOs.Products;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class GroceryListService(
    IGroceryListRepository groceryListRepository,
    IProductRepository productRepository,
    IStockUnitRepository stockUnitRepository,
    IRecipeRepository recipeRepository
) : IGroceryListService
{
    public async Task<GroceryListResponse?> GetCurrentAsync()
    {
        var list = await groceryListRepository.GetCurrentAsync();
        return list is null ? null : ToResponse(list);
    }

    public async Task<GroceryListResponse> GenerateAsync(GenerateGroceryListRequest request)
    {
        var allUnits = await stockUnitRepository.GetAllWithDetailsAsync();
        var stockCountByProduct = allUnits
            .GroupBy(u => u.ProductId)
            .ToDictionary(g => g.Key, g => g.Count());

        var items = new List<(Guid ProductId, GroceryListItemSource Source, Guid? RecipeId, int? Quantity)>();

        // Min stock: product threshold first, category threshold as fallback
        var allProducts = await productRepository.GetAllWithDetailsAsync();
        foreach (var product in allProducts)
        {
            var threshold = product.MinStockUnits ?? product.Category?.MinStockUnits;
            if (threshold is null) continue;

            var currentStock = stockCountByProduct.GetValueOrDefault(product.Id, 0);
            if (currentStock < threshold)
                items.Add((product.Id, GroceryListItemSource.MinStock, null, threshold.Value - currentStock));
        }

        var productLookup = allProducts.ToDictionary(p => p.Id);

        // Recipe items: skip products with a threshold (handled by min-stock flow) or already in stock
        var recipes = await recipeRepository.GetByIdsWithProductsAsync(request.RecipeIds ?? []);
        foreach (var recipe in recipes)
            foreach (var product in recipe.Products)
            {
                if (!productLookup.TryGetValue(product.Id, out var full)) continue;
                var hasThreshold = (full.MinStockUnits ?? full.Category?.MinStockUnits) is not null;
                if (hasThreshold) continue;
                if (stockCountByProduct.GetValueOrDefault(product.Id, 0) > 0) continue;
                items.Add((product.Id, GroceryListItemSource.Recipe, recipe.Id, null));
            }

        // Articles manuels
        foreach (var productId in request.ManualProductIds ?? [])
            items.Add((productId, GroceryListItemSource.Manual, null, null));

        // Dedup by (ProductId, Source) — same product can appear as both MinStock and Recipe
        var deduped = items
            .GroupBy(i => (i.ProductId, i.Source))
            .Select(g => g.First())
            .ToList();

        var groceryList = new GroceryList
        {
            Id = Guid.NewGuid(),
            GeneratedAt = DateTime.UtcNow,
            Items = deduped
                .Where(i => productLookup.ContainsKey(i.ProductId))
                .Select(i => new GroceryListItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = i.ProductId,
                    Source = i.Source,
                    RecipeId = i.RecipeId,
                    Quantity = i.Quantity,
                    Product = productLookup[i.ProductId]
                })
                .ToList()
        };

        var saved = await groceryListRepository.ReplaceAsync(groceryList);
        return ToResponse(saved);
    }

    public async Task RemoveItemAsync(Guid itemId) =>
        await groceryListRepository.RemoveItemAsync(itemId);

    public async Task ClearAsync() =>
        await groceryListRepository.ClearAsync();

    private static GroceryListResponse ToResponse(GroceryList list) => new(
        list.Id,
        list.GeneratedAt,
        list.Items.Select(ToItemResponse)
    );

    private static GroceryListItemResponse ToItemResponse(GroceryListItem item) => new(
        item.Id,
        ToProductResponse(item.Product!),
        item.Source,
        item.RecipeId,
        item.Quantity
    );

    private static ProductResponse ToProductResponse(Product p) =>
        new(p.Id, p.CategoryId, p.Name, p.FreeText, p.MinStockUnits);
}
