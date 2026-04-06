namespace Stockly.Core.Entities;

public class PrinterFormat
{
    public Guid Id { get; set; }
    public Guid PrinterId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal WidthMm { get; set; }
    public decimal HeightMm { get; set; }
    public Printer? Printer { get; set; }
}
