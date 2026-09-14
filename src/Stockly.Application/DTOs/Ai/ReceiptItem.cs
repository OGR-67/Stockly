namespace Stockly.Application.DTOs.Ai;

public record ReceiptItem(
    string ProductName,
    int Quantity,
    Guid? SuggestedLocationId,
    DateOnly? SuggestedExpiration,
    Guid? MatchedProductId
);
