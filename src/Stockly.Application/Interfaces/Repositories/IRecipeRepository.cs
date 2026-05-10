using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface IRecipeRepository
{
    Task<IEnumerable<Recipe>> GetAllAsync();
    Task<Recipe?> GetByIdWithProductsAsync(Guid id);
    Task<IEnumerable<Recipe>> GetByIdsWithProductsAsync(IEnumerable<Guid> ids);
    Task<Recipe> CreateAsync(Recipe recipe);
    Task<Recipe> UpdateAsync(Recipe recipe);
    Task DeleteAsync(Guid id);
}
