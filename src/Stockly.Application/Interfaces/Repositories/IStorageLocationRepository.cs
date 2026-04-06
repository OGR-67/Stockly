using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface IStorageLocationRepository
{
    Task<IEnumerable<StorageLocation>> GetAllAsync();
    Task<StorageLocation?> GetByIdAsync(Guid id);
    Task<StorageLocation> CreateAsync(StorageLocation location);
    Task<StorageLocation> UpdateAsync(StorageLocation location);
    Task DeleteAsync(Guid id);
}
