using Stockly.Application.DTOs.Categories;

namespace Stockly.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponse>> GetAllAsync();
    Task<CategoryResponse?> GetByIdAsync(Guid id);
    Task<CategoryResponse> CreateAsync(SaveCategoryRequest request);
    Task<CategoryResponse?> UpdateAsync(Guid id, SaveCategoryRequest request);
    Task<bool> DeleteAsync(Guid id);
}
