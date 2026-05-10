namespace Stockly.Core.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsPerishable { get; set; }
    public bool IsFresh { get; set; }
    public int? DefaultClosedDays { get; set; }
    public int? DefaultOpenedDays { get; set; }
    public int? DefaultFrozenDays { get; set; }
    public string? FreeText { get; set; }
    public int? MinStockUnits { get; set; }
}
