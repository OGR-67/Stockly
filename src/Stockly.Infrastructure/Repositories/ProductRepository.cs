using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class ProductRepository(StocklyDbContext context) : IProductRepository
{
    public async Task<IEnumerable<Product>> GetAllWithDetailsAsync() =>
        await context.Products
            .Include(p => p.Category)
            .Include(p => p.Barcodes)
            .ToListAsync();

    public async Task<Product?> GetByIdWithDetailsAsync(Guid id) =>
        await context.Products
            .Include(p => p.Category)
            .Include(p => p.Barcodes)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Product?> GetByBarcodeAsync(string barcode) =>
        await context.Products
            .Include(p => p.Category)
            .Include(p => p.Barcodes)
            .FirstOrDefaultAsync(p => p.Barcodes.Any(b => b.Code == barcode));

    public async Task<Product> CreateAsync(Product product)
    {
        context.Products.Add(product);
        await context.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        context.Products.Update(product);
        await context.SaveChangesAsync();
        return product;
    }

    public async Task DeleteAsync(Guid id)
    {
        var product = await context.Products.FindAsync(id);
        if (product is not null)
        {
            context.Products.Remove(product);
            await context.SaveChangesAsync();
        }
    }

    public async Task AddBarcodeAsync(Guid productId, string barcode)
    {
        context.Barcodes.Add(new Barcode { Code = barcode, ProductId = productId });
        await context.SaveChangesAsync();
    }

    public async Task DeleteBarcodeAsync(string barcode)
    {
        var entity = await context.Barcodes.FindAsync(barcode);
        if (entity is not null)
        {
            context.Barcodes.Remove(entity);
            await context.SaveChangesAsync();
        }
    }
}
