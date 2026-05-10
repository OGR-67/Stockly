using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class GroceryListRepository(StocklyDbContext context) : IGroceryListRepository
{
    public async Task<GroceryList?> GetCurrentAsync() =>
        await WithItems()
            .OrderByDescending(g => g.GeneratedAt)
            .FirstOrDefaultAsync();

    public async Task<GroceryList> ReplaceAsync(GroceryList groceryList)
    {
        var existing = await context.GroceryLists.ToListAsync();
        context.GroceryLists.RemoveRange(existing);

        context.GroceryLists.Add(groceryList);
        await context.SaveChangesAsync();

        return await WithItems().FirstAsync(g => g.Id == groceryList.Id);
    }

    public async Task RemoveItemAsync(Guid itemId)
    {
        var item = await context.GroceryListItems.FindAsync(itemId);
        if (item is not null)
        {
            context.GroceryListItems.Remove(item);
            await context.SaveChangesAsync();
        }
    }

    public async Task ClearAsync()
    {
        var existing = await context.GroceryLists.ToListAsync();
        context.GroceryLists.RemoveRange(existing);
        await context.SaveChangesAsync();
    }

    private IQueryable<GroceryList> WithItems() =>
        context.GroceryLists
            .Include(g => g.Items)
                .ThenInclude(i => i.Product);
}
