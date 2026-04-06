using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class StorageLocationRepository(StocklyDbContext context) : IStorageLocationRepository
{
    public async Task<IEnumerable<StorageLocation>> GetAllAsync() =>
        await context.StorageLocations.ToListAsync();

    public async Task<StorageLocation?> GetByIdAsync(Guid id) =>
        await context.StorageLocations.FindAsync(id);

    public async Task<StorageLocation> CreateAsync(StorageLocation location)
    {
        context.StorageLocations.Add(location);
        await context.SaveChangesAsync();
        return location;
    }

    public async Task<StorageLocation> UpdateAsync(StorageLocation location)
    {
        context.StorageLocations.Update(location);
        await context.SaveChangesAsync();
        return location;
    }

    public async Task DeleteAsync(Guid id)
    {
        var location = await context.StorageLocations.FindAsync(id);
        if (location is not null)
        {
            context.StorageLocations.Remove(location);
            await context.SaveChangesAsync();
        }
    }
}
