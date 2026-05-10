namespace Stockly.Core.Entities;

public class GroceryListItem
{
    public Guid Id { get; set; }
    public Guid GroceryListId { get; set; }
    public Guid ProductId { get; set; }
    public GroceryListItemSource Source { get; set; }
    public Guid? RecipeId { get; set; }
    public int? Quantity { get; set; }
    public GroceryList? GroceryList { get; set; }
    public Product? Product { get; set; }
}
