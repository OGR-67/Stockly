namespace Stockly.Application.DTOs.Printers;

public record PrinterResponse(Guid Id, string Name, string QueueName, int Port, bool IsDefault);
