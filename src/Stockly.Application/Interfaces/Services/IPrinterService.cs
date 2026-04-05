using Stockly.Application.DTOs.Printers;

namespace Stockly.Application.Interfaces.Services;

public interface IPrinterService
{
    Task<IEnumerable<PrinterResponse>> GetAllAsync();
    Task<IEnumerable<PrinterFormatResponse>> GetFormatsAsync(Guid printerId);
    Task PrintAsync(Guid printerId, PrintRequest request);
}
