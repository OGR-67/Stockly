namespace Stockly.Application.DTOs.Products;

public record ProductResponse(
    Guid Id,
    Guid CategoryId,
    string Name,
    string? FreeText,
    int? MinStockUnits
);
