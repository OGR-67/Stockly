using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.Recipes;

public record RecipeResponse(Guid Id, string Name, RecipeType Type, string? FreeText, int ProductCount);
