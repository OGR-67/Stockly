namespace Stockly.Application.DTOs.Printers;

public record PrinterResponse(Guid Id, string Name, bool IsDefault);
