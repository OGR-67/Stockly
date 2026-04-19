using Stockly.Application.DTOs.Printers;

namespace Stockly.Application.Interfaces.Services;

public interface IPrintingService
{
    Task PrintAsync(Guid printerId, Guid formatId, PrintRequest job);
    Task PrintLabelAsync(Guid printerId, PrintLabelRequest request);
}
