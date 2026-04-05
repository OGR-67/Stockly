namespace Stockly.Core.Entities;

public class StorageLocation
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public LocationType Type { get; set; }
}
