using Stockly.Application.DTOs.Printers;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class PrinterService(IPrinterRepository repository, IPrintingService printingService) : IPrinterService
{
    // Brother QL series standard label formats
    private static readonly IReadOnlyList<(string Name, decimal WidthMm, decimal HeightMm)> BrotherQlFormats =
    [
        ("DK-11209 – 62×29mm", 62, 29),
        // other format will come as needed...
    ];

    public async Task<IEnumerable<PrinterResponse>> GetAllAsync()
    {
        var printers = await repository.GetAllAsync();
        return printers.Select(ToResponse);
    }

    public async Task<IEnumerable<PrinterFormatResponse>> GetFormatsAsync(Guid printerId)
    {
        var formats = await repository.GetFormatsByPrinterIdAsync(printerId);
        return formats.Select(f => new PrinterFormatResponse(f.Id, f.Name, f.WidthMm, f.HeightMm));
    }

    public async Task<PrinterResponse> RegisterAsync(RegisterPrinterRequest request)
    {
        var printer = new Printer
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            IpAddress = request.IpAddress,
            Port = request.Port,
            IsDefault = request.IsDefault,
            Formats = BrotherQlFormats.Select(f => new PrinterFormat
            {
                Id = Guid.NewGuid(),
                Name = f.Name,
                WidthMm = f.WidthMm,
                HeightMm = f.HeightMm,
            }).ToList(),
        };

        var created = await repository.CreateAsync(printer);
        return ToResponse(created);
    }

    public async Task DeleteAsync(Guid id)
    {
        _ = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Printer {id} not found.");
        await repository.DeleteAsync(id);
    }

    public async Task PrintAsync(Guid printerId, PrintRequest request)
    {
        await printingService.PrintAsync(printerId, request.FormatId, request);
    }

    private static PrinterResponse ToResponse(Printer p) =>
        new(p.Id, p.Name, p.IpAddress, p.Port, p.IsDefault);
}
