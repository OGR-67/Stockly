using Stockly.Application.DTOs.Categories;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class CategoryService(ICategoryRepository repository) : ICategoryService
{
    public async Task<IEnumerable<CategoryResponse>> GetAllAsync()
    {
        var categories = await repository.GetAllAsync();
        return categories.Select(ToResponse);
    }

    public async Task<CategoryResponse> GetByIdAsync(Guid id)
    {
        var category = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category {id} not found.");
        return ToResponse(category);
    }

    public async Task<CategoryResponse> CreateAsync(SaveCategoryRequest request)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            IsPerishable = request.IsPerishable,
            IsFresh = request.IsFresh,
            DefaultClosedDays = request.DefaultClosedDays,
            DefaultOpenedDays = request.DefaultOpenedDays,
            DefaultFrozenDays = request.DefaultFrozenDays,
            FreeText = request.FreeText,
            MinStockUnits = request.MinStockUnits
        };
        var created = await repository.CreateAsync(category);
        return ToResponse(created);
    }

    public async Task<CategoryResponse> UpdateAsync(Guid id, SaveCategoryRequest request)
    {
        var existing = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category {id} not found.");

        existing.Name = request.Name;
        existing.IsPerishable = request.IsPerishable;
        existing.IsFresh = request.IsFresh;
        existing.DefaultClosedDays = request.DefaultClosedDays;
        existing.DefaultOpenedDays = request.DefaultOpenedDays;
        existing.DefaultFrozenDays = request.DefaultFrozenDays;
        existing.FreeText = request.FreeText;
        existing.MinStockUnits = request.MinStockUnits;

        var updated = await repository.UpdateAsync(existing);
        return ToResponse(updated);
    }

    public async Task DeleteAsync(Guid id)
    {
        _ = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category {id} not found.");
        await repository.DeleteAsync(id);
    }

    private static CategoryResponse ToResponse(Category c) => new(
        c.Id, c.Name, c.IsPerishable, c.IsFresh,
        c.DefaultClosedDays, c.DefaultOpenedDays, c.DefaultFrozenDays, c.FreeText, c.MinStockUnits
    );
}
