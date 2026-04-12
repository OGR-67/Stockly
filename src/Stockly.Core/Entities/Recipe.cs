namespace Stockly.Core.Entities;

public class Recipe
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public RecipeType Type { get; set; }
    public string? FreeText { get; set; }
    public List<Product> Products { get; set; } = [];
}
