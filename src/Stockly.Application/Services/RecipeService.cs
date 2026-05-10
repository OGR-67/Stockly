using Stockly.Application.DTOs.Products;
using Stockly.Application.DTOs.Recipes;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class RecipeService(IRecipeRepository repository, IProductRepository productRepository) : IRecipeService
{
    public async Task<IEnumerable<RecipeResponse>> GetAllAsync()
    {
        var recipes = await repository.GetAllAsync();
        return recipes.Select(ToResponse);
    }

    public async Task<RecipeResponse> CreateAsync(SaveRecipeRequest request)
    {
        var products = await FetchProductsAsync(request.ProductIds);

        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            FreeText = request.FreeText,
            Products = products.ToList(),
        };

        var created = await repository.CreateAsync(recipe);
        return ToResponse(created);
    }

    public async Task<RecipeResponse> UpdateAsync(Guid id, SaveRecipeRequest request)
    {
        var recipe = await repository.GetByIdWithProductsAsync(id)
            ?? throw new NotFoundException($"Recipe {id} not found.");

        var products = await FetchProductsAsync(request.ProductIds);

        recipe.Name = request.Name;
        recipe.Type = request.Type;
        recipe.FreeText = request.FreeText;
        recipe.Products = products.ToList();

        var updated = await repository.UpdateAsync(recipe);
        return ToResponse(updated);
    }

    public async Task DeleteAsync(Guid id)
    {
        _ = await repository.GetByIdWithProductsAsync(id)
            ?? throw new NotFoundException($"Recipe {id} not found.");
        await repository.DeleteAsync(id);
    }

    private async Task<IEnumerable<Product>> FetchProductsAsync(IEnumerable<Guid> productIds)
    {
        var products = new List<Product>();
        foreach (var productId in productIds)
        {
            var product = await productRepository.GetByIdWithDetailsAsync(productId)
                ?? throw new NotFoundException($"Product {productId} not found.");
            products.Add(product);
        }
        return products;
    }

    private static RecipeResponse ToResponse(Recipe r) =>
        new(r.Id, r.Name, r.Type, r.FreeText, r.Products.Select(ToProductResponse));

    private static ProductResponse ToProductResponse(Product p) =>
        new(p.Id, p.CategoryId, p.Name, p.FreeText, p.MinStockUnits);
}
