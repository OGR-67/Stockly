namespace Stockly.Core.Entities;

public class Product
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? FreeText { get; set; }
    public Category? Category { get; set; }
    public List<Barcode> Barcodes { get; set; } = [];
}
