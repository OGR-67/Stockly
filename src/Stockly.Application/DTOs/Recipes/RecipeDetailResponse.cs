using Stockly.Core.Entities;
using Stockly.Application.DTOs.Products;

namespace Stockly.Application.DTOs.Recipes;

public record RecipeDetailResponse(
    Guid Id,
    string Name,
    RecipeType Type,
    string? FreeText,
    IEnumerable<ProductResponse> Products
);
