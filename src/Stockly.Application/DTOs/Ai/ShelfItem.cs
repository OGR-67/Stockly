namespace Stockly.Application.DTOs.Ai;

public record ShelfItem(
    string ProductName,
    Guid? MatchedProductId
);
