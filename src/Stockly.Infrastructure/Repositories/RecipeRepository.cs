using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class RecipeRepository(StocklyDbContext context) : IRecipeRepository
{
    public async Task<IEnumerable<Recipe>> GetAllAsync() =>
        await WithProducts().AsNoTracking().ToListAsync();

    public async Task<Recipe?> GetByIdWithProductsAsync(Guid id) =>
        await WithProducts().FirstOrDefaultAsync(r => r.Id == id);

    public async Task<Recipe> CreateAsync(Recipe recipe)
    {
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();
        return recipe;
    }

    public async Task<Recipe> UpdateAsync(Recipe recipe)
    {
        context.Recipes.Update(recipe);
        await context.SaveChangesAsync();
        return recipe;
    }

    public async Task DeleteAsync(Guid id)
    {
        var recipe = await context.Recipes.FindAsync(id);
        if (recipe != null)
        {
            context.Recipes.Remove(recipe);
            await context.SaveChangesAsync();
        }
    }

    private IQueryable<Recipe> WithProducts() =>
        context.Recipes.Include(r => r.Products);
}
