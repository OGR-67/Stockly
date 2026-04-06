using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface IPrinterRepository
{
    Task<IEnumerable<Printer>> GetAllAsync();
    Task<Printer?> GetByIdAsync(Guid id);
    Task<IEnumerable<PrinterFormat>> GetFormatsByPrinterIdAsync(Guid printerId);
    Task<Printer> CreateAsync(Printer printer);
    Task DeleteAsync(Guid id);
}
