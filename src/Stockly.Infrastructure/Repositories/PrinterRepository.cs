using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class PrinterRepository(StocklyDbContext context) : IPrinterRepository
{
    public async Task<IEnumerable<Printer>> GetAllAsync() =>
        await context.Printers.Include(p => p.Formats).ToListAsync();

    public async Task<IEnumerable<PrinterFormat>> GetFormatsByPrinterIdAsync(Guid printerId) =>
        await context.PrinterFormats
            .Where(f => f.PrinterId == printerId)
            .ToListAsync();
}
