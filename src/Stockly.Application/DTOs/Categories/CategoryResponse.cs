namespace Stockly.Application.DTOs.Categories;

public record CategoryResponse(
    Guid Id,
    string Name,
    bool IsPerishable,
    bool IsFresh,
    int? DefaultClosedDays,
    int? DefaultOpenedDays,
    int? DefaultFrozenDays,
    string? FreeText
);
