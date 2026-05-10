using Stockly.Application.DTOs.Products;
using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.GroceryList;

public record GroceryListResponse(
    Guid Id,
    DateTime GeneratedAt,
    IEnumerable<GroceryListItemResponse> Items
);

public record GroceryListItemResponse(
    Guid Id,
    ProductResponse Product,
    GroceryListItemSource Source,
    Guid? RecipeId,
    int? Quantity
);
