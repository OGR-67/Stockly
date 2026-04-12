using System.ComponentModel.DataAnnotations;
using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.Recipes;

public record SaveRecipeRequest(
    [Required, MinLength(1)] string Name,
    RecipeType Type,
    string? FreeText,
    IEnumerable<Guid> ProductIds
);
