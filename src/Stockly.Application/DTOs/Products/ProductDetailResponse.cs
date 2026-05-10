using Stockly.Application.DTOs.Categories;

namespace Stockly.Application.DTOs.Products;

public record BarcodeResponse(string Code, Guid ProductId);

public record ProductDetailResponse(
    Guid Id,
    Guid CategoryId,
    string Name,
    string? FreeText,
    int? MinStockUnits,
    CategoryResponse Category,
    IEnumerable<BarcodeResponse> Barcodes
);
