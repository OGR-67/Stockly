using Stockly.Application.DTOs.Printers;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class IppPrintingService : IPrintingService
{
    public Task PrintAsync(Guid printerId, Guid formatId, PrintRequest job)
    {
        throw new NotImplementedException("IPP printing not yet implemented.");
    }
}
