using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Categories;

public record SaveCategoryRequest(
    [Required, MinLength(1)] string Name,
    bool IsPerishable,
    bool IsFresh,
    int? DefaultClosedDays,
    int? DefaultOpenedDays,
    int? DefaultFrozenDays,
    string? FreeText
);
