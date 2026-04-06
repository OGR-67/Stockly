namespace Stockly.Core.Entities;

public class Printer
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public int Port { get; set; } = 631;
    public bool IsDefault { get; set; }
    public List<PrinterFormat> Formats { get; set; } = [];
}
