namespace Stockly.Core.Entities;

public class Printer
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public List<PrinterFormat> Formats { get; set; } = [];
}
