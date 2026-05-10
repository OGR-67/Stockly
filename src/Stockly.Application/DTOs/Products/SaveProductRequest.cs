using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Products;

public record SaveProductRequest(
    [Required] Guid CategoryId,
    [Required, MinLength(1)] string Name,
    string? FreeText,
    int? MinStockUnits
);
