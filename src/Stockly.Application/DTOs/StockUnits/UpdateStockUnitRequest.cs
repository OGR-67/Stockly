namespace Stockly.Application.DTOs.StockUnits;

public record UpdateStockUnitRequest(
    DateTime? ExpirationDate,
    string? FreeText
);
