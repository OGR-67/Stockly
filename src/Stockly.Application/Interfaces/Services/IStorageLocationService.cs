using Stockly.Application.DTOs.StorageLocations;

namespace Stockly.Application.Interfaces.Services;

public interface IStorageLocationService
{
    Task<IEnumerable<StorageLocationResponse>> GetAllAsync();
    Task<StorageLocationResponse> GetByIdAsync(Guid id);
    Task<StorageLocationResponse> CreateAsync(SaveStorageLocationRequest request);
    Task<StorageLocationResponse> UpdateAsync(Guid id, SaveStorageLocationRequest request);
    Task DeleteAsync(Guid id);
}
