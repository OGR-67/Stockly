using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class CategoryRepository(StocklyDbContext context) : ICategoryRepository
{
    public async Task<IEnumerable<Category>> GetAllAsync() =>
        await context.Categories.ToListAsync();

    public async Task<Category?> GetByIdAsync(Guid id) =>
        await context.Categories.FindAsync(id);

    public async Task<Category> CreateAsync(Category category)
    {
        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        context.Categories.Update(category);
        await context.SaveChangesAsync();
        return category;
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await context.Categories.FindAsync(id);
        if (category is not null)
        {
            context.Categories.Remove(category);
            await context.SaveChangesAsync();
        }
    }
}
