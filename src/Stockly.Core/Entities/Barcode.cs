namespace Stockly.Core.Entities;

public class Barcode
{
    public string Code { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
}
