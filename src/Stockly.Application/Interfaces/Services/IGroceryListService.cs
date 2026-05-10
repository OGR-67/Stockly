using Stockly.Application.DTOs.GroceryList;

namespace Stockly.Application.Interfaces.Services;

public interface IGroceryListService
{
    Task<GroceryListResponse?> GetCurrentAsync();
    Task<GroceryListResponse> GenerateAsync(GenerateGroceryListRequest request);
    Task RemoveItemAsync(Guid itemId);
    Task ClearAsync();
}
