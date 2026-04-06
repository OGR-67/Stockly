namespace Stockly.Application.DTOs.Printers;

public record PrinterResponse(Guid Id, string Name, string IpAddress, int Port, bool IsDefault);
