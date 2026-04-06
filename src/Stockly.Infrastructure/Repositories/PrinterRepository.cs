using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class PrinterRepository(StocklyDbContext context) : IPrinterRepository
{
    public async Task<IEnumerable<Printer>> GetAllAsync() =>
        await context.Printers.Include(p => p.Formats).ToListAsync();

    public async Task<Printer?> GetByIdAsync(Guid id) =>
        await context.Printers.Include(p => p.Formats).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<PrinterFormat>> GetFormatsByPrinterIdAsync(Guid printerId) =>
        await context.PrinterFormats.Where(f => f.PrinterId == printerId).ToListAsync();

    public async Task<Printer> CreateAsync(Printer printer)
    {
        context.Printers.Add(printer);
        await context.SaveChangesAsync();
        return printer;
    }

    public async Task DeleteAsync(Guid id)
    {
        var printer = await context.Printers.FindAsync(id);
        if (printer is not null)
        {
            context.Printers.Remove(printer);
            await context.SaveChangesAsync();
        }
    }
}
