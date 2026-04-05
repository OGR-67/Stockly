namespace Stockly.Application.DTOs.Printers;

public record PrinterFormatResponse(Guid Id, string Name, decimal WidthMm, decimal HeightMm);
