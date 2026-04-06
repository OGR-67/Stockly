using Stockly.Application.DTOs.Products;
using Stockly.Application.DTOs.StorageLocations;

namespace Stockly.Application.DTOs.StockUnits;

public record StockUnitDetailResponse(
    Guid Id,
    Guid ProductId,
    Guid LocationId,
    DateTime? ExpirationDate,
    bool IsOpened,
    DateTime CreatedAt,
    DateTime? OpenedAt,
    DateTime? ConsumedAt,
    ProductDetailResponse Product,
    StorageLocationResponse Location
);
