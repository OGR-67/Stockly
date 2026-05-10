using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface IGroceryListRepository
{
    Task<GroceryList?> GetCurrentAsync();
    Task<GroceryList> ReplaceAsync(GroceryList groceryList);
    Task RemoveItemAsync(Guid itemId);
    Task ClearAsync();
}
