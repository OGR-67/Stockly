using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface IStockUnitRepository
{
    Task<IEnumerable<StockUnit>> GetAllWithDetailsAsync();
    Task<IEnumerable<StockUnit>> GetByLocationWithDetailsAsync(Guid locationId);
    Task<StockUnit?> GetByIdAsync(Guid id);
    Task<StockUnit?> GetByIdWithDetailsAsync(Guid id);
    Task<StockUnit> CreateAsync(StockUnit stockUnit);
    Task<StockUnit> UpdateAsync(StockUnit stockUnit);
    Task DeleteAsync(Guid id);
}
