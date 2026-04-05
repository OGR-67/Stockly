using Stockly.Application.DTOs.StorageLocations;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class StorageLocationService(IStorageLocationRepository repository) : IStorageLocationService
{
    public async Task<IEnumerable<StorageLocationResponse>> GetAllAsync()
    {
        var locations = await repository.GetAllAsync();
        return locations.Select(ToResponse);
    }

    public async Task<StorageLocationResponse?> GetByIdAsync(Guid id)
    {
        var location = await repository.GetByIdAsync(id);
        return location is null ? null : ToResponse(location);
    }

    public async Task<StorageLocationResponse> CreateAsync(SaveStorageLocationRequest request)
    {
        var location = new StorageLocation
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type
        };
        var created = await repository.CreateAsync(location);
        return ToResponse(created);
    }

    public async Task<StorageLocationResponse?> UpdateAsync(Guid id, SaveStorageLocationRequest request)
    {
        var existing = await repository.GetByIdAsync(id);
        if (existing is null) return null;

        existing.Name = request.Name;
        existing.Type = request.Type;

        var updated = await repository.UpdateAsync(existing);
        return ToResponse(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await repository.GetByIdAsync(id);
        if (existing is null) return false;
        await repository.DeleteAsync(id);
        return true;
    }

    private static StorageLocationResponse ToResponse(StorageLocation l) => new(l.Id, l.Name, l.Type);
}
