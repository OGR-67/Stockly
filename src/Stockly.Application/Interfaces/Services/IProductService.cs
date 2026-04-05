using Stockly.Application.DTOs.Products;

namespace Stockly.Application.Interfaces.Services;

public interface IProductService
{
    Task<IEnumerable<ProductDetailResponse>> GetAllAsync();
    Task<ProductDetailResponse?> GetByIdAsync(Guid id);
    Task<ProductDetailResponse?> GetByBarcodeAsync(string barcode);
    Task<ProductResponse> CreateAsync(SaveProductRequest request);
    Task<ProductResponse?> UpdateAsync(Guid id, SaveProductRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> AddBarcodeAsync(Guid productId, string barcode);
    Task<bool> DeleteBarcodeAsync(string barcode);
}
