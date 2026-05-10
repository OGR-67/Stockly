namespace Stockly.Core.Entities;

public class GroceryList
{
    public Guid Id { get; set; }
    public DateTime GeneratedAt { get; set; }
    public List<GroceryListItem> Items { get; set; } = [];
}
