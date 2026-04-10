using Stockly.Application.DTOs.StockUnits;

namespace Stockly.Application.Interfaces.Services;

public interface IStockUnitService
{
    Task<IEnumerable<StockUnitDetailResponse>> GetAllAsync();
    Task<IEnumerable<StockUnitDetailResponse>> GetByLocationAsync(Guid locationId);
    Task<StockUnitDetailResponse> AddAsync(CreateStockUnitRequest request);
    Task<StockUnitDetailResponse> UpdateAsync(Guid id, UpdateStockUnitRequest request);
    Task<StockUnitDetailResponse> OpenAsync(Guid id);
    Task<StockUnitDetailResponse> MoveAsync(Guid id, MoveStockUnitRequest request);
    Task<StockUnitDetailResponse> ConsumeAsync(Guid id);
    Task DeleteAsync(Guid id);
}
