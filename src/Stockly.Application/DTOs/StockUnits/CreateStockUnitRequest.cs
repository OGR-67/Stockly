using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.StockUnits;

public record CreateStockUnitRequest(
    [Required] Guid ProductId,
    [Required] Guid LocationId,
    DateTime? ExpirationDate,
    string? FreeText
);
