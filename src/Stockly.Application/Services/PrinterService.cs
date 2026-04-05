using Stockly.Application.DTOs.Printers;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Application.Services;

public class PrinterService(IPrinterRepository repository, IPrintingService printingService) : IPrinterService
{
    public async Task<IEnumerable<PrinterResponse>> GetAllAsync()
    {
        var printers = await repository.GetAllAsync();
        return printers.Select(p => new PrinterResponse(p.Id, p.Name, p.IsDefault));
    }

    public async Task<IEnumerable<PrinterFormatResponse>> GetFormatsAsync(Guid printerId)
    {
        var formats = await repository.GetFormatsByPrinterIdAsync(printerId);
        return formats.Select(f => new PrinterFormatResponse(f.Id, f.Name, f.WidthMm, f.HeightMm));
    }

    public async Task PrintAsync(Guid printerId, PrintRequest request)
    {
        await printingService.PrintAsync(printerId, request.FormatId, request);
    }
}
