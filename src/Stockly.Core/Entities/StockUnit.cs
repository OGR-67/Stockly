namespace Stockly.Core.Entities;

public class StockUnit
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid LocationId { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public bool IsOpened { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? OpenedAt { get; set; }
    public DateTime? ConsumedAt { get; set; }
    public Product? Product { get; set; }
    public StorageLocation? Location { get; set; }
}
