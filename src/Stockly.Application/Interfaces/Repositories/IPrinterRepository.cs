using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface IPrinterRepository
{
    Task<IEnumerable<Printer>> GetAllAsync();
    Task<IEnumerable<PrinterFormat>> GetFormatsByPrinterIdAsync(Guid printerId);
}
