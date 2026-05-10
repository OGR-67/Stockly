namespace Stockly.Application.DTOs.GroceryList;

public record GenerateGroceryListRequest(
    IEnumerable<Guid>? RecipeIds,
    IEnumerable<Guid>? ManualProductIds
);
