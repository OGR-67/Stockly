using Stockly.Application.DTOs.Recipes;

namespace Stockly.Application.Interfaces.Services;

public interface IRecipeService
{
    Task<IEnumerable<RecipeResponse>> GetAllAsync();
    Task<RecipeResponse> CreateAsync(SaveRecipeRequest request);
    Task<RecipeResponse> UpdateAsync(Guid id, SaveRecipeRequest request);
    Task DeleteAsync(Guid id);
}
