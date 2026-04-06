using Stockly.Application.DTOs.Categories;
using Stockly.Application.DTOs.Products;
using Stockly.Application.DTOs.StockUnits;
using Stockly.Application.DTOs.StorageLocations;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class StockUnitService(IStockUnitRepository repository, IStorageLocationRepository locationRepository) : IStockUnitService
{
    public async Task<IEnumerable<StockUnitDetailResponse>> GetAllAsync()
    {
        var units = await repository.GetAllWithDetailsAsync();
        return units.Select(ToDetailResponse);
    }

    public async Task<IEnumerable<StockUnitDetailResponse>> GetByLocationAsync(Guid locationId)
    {
        var units = await repository.GetByLocationWithDetailsAsync(locationId);
        return units.Select(ToDetailResponse);
    }

    public async Task<StockUnitDetailResponse> AddAsync(CreateStockUnitRequest request)
    {
        var unit = new StockUnit
        {
            Id = Guid.NewGuid(),
            ProductId = request.ProductId,
            LocationId = request.LocationId,
            ExpirationDate = request.ExpirationDate,
            IsOpened = false,
            CreatedAt = DateTime.UtcNow,
            OpenedAt = null,
            ConsumedAt = null
        };
        var created = await repository.CreateAsync(unit);
        var withDetails = await repository.GetByIdWithDetailsAsync(created.Id) ?? created;
        return ToDetailResponse(withDetails);
    }

    public async Task<StockUnitDetailResponse> OpenAsync(Guid id)
    {
        var unit = await repository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException($"StockUnit {id} not found.");

        unit.IsOpened = true;
        unit.OpenedAt = DateTime.UtcNow;

        var updated = await repository.UpdateAsync(unit);
        return ToDetailResponse(updated);
    }

    public async Task<StockUnitDetailResponse> MoveAsync(Guid id, MoveStockUnitRequest request)
    {
        var unit = await repository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException($"StockUnit {id} not found.");

        await UpdateDLC(unit, request);
        unit.LocationId = request.LocationId;

        var updated = await repository.UpdateAsync(unit);
        return ToDetailResponse(updated);
    }

    public async Task<StockUnitDetailResponse> ConsumeAsync(Guid id)
    {
        var unit = await repository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException($"StockUnit {id} not found.");

        unit.ConsumedAt = DateTime.UtcNow;

        var updated = await repository.UpdateAsync(unit);
        return ToDetailResponse(updated);
    }

    public async Task DeleteAsync(Guid id)
    {
        _ = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"StockUnit {id} not found.");
        await repository.DeleteAsync(id);
    }

    private static StockUnitDetailResponse ToDetailResponse(StockUnit u) => new(
        u.Id,
        u.ProductId,
        u.LocationId,
        u.ExpirationDate,
        u.IsOpened,
        u.CreatedAt,
        u.OpenedAt,
        u.ConsumedAt,
        ToProductDetailResponse(u.Product!),
        ToLocationResponse(u.Location!)
    );

    private static ProductDetailResponse ToProductDetailResponse(Product p) => new(
        p.Id,
        p.CategoryId,
        p.Name,
        p.FreeText,
        ToCategoryResponse(p.Category!),
        p.Barcodes.Select(b => new BarcodeResponse(b.Code, b.ProductId))
    );

    private static CategoryResponse ToCategoryResponse(Category c) => new(
        c.Id, c.Name, c.IsPerishable, c.IsFresh,
        c.DefaultClosedDays, c.DefaultOpenedDays, c.DefaultFrozenDays, c.FreeText
    );

    private static StorageLocationResponse ToLocationResponse(StorageLocation l) => new(l.Id, l.Name, l.Type);

    private async Task UpdateDLC(StockUnit unit, MoveStockUnitRequest request)
    {
        if (unit.Product?.Category?.IsPerishable != true) return;

        var targetLocation = await locationRepository.GetByIdAsync(request.LocationId);

        if (targetLocation?.Type == LocationType.Freezer)
        {
            var freezerDays = unit.Product.Category.DefaultFrozenDays;
            if (freezerDays.HasValue)
                unit.ExpirationDate = DateTime.UtcNow.AddDays(freezerDays.Value);
        }
        else if (unit.Location?.Type == LocationType.Freezer)
        {
            unit.ExpirationDate = DateTime.UtcNow.AddDays(1);
        }
    }
}
