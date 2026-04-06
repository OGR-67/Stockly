using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class StockUnitRepository(StocklyDbContext context) : IStockUnitRepository
{
    public async Task<IEnumerable<StockUnit>> GetAllWithDetailsAsync() =>
        await WithDetails().Where(s => s.ConsumedAt == null).ToListAsync();

    public async Task<IEnumerable<StockUnit>> GetByLocationWithDetailsAsync(Guid locationId) =>
        await WithDetails().Where(s => s.LocationId == locationId && s.ConsumedAt == null).ToListAsync();

    public async Task<StockUnit?> GetByIdAsync(Guid id) =>
        await context.StockUnits.FindAsync(id);

    public async Task<StockUnit?> GetByIdWithDetailsAsync(Guid id) =>
        await WithDetails().FirstOrDefaultAsync(s => s.Id == id);

    public async Task<StockUnit> CreateAsync(StockUnit stockUnit)
    {
        context.StockUnits.Add(stockUnit);
        await context.SaveChangesAsync();
        return stockUnit;
    }

    public async Task<StockUnit> UpdateAsync(StockUnit stockUnit)
    {
        context.StockUnits.Update(stockUnit);
        await context.SaveChangesAsync();
        return stockUnit;
    }

    public async Task DeleteAsync(Guid id)
    {
        var unit = await context.StockUnits.FindAsync(id);
        if (unit is not null)
        {
            context.StockUnits.Remove(unit);
            await context.SaveChangesAsync();
        }
    }

    private IQueryable<StockUnit> WithDetails() =>
        context.StockUnits
            .Include(s => s.Product)
                .ThenInclude(p => p!.Category)
            .Include(s => s.Product)
                .ThenInclude(p => p!.Barcodes)
            .Include(s => s.Location);
}
