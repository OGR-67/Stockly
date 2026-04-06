using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllWithDetailsAsync();
    Task<Product?> GetByIdWithDetailsAsync(Guid id);
    Task<Product?> GetByBarcodeAsync(string barcode);
    Task<Product> CreateAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task DeleteAsync(Guid id);
    Task AddBarcodeAsync(Guid productId, string barcode);
    Task DeleteBarcodeAsync(string barcode);
}
