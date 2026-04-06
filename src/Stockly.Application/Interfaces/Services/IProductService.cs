using Stockly.Application.DTOs.Products;

namespace Stockly.Application.Interfaces.Services;

public interface IProductService
{
    Task<IEnumerable<ProductDetailResponse>> GetAllAsync();
    Task<ProductDetailResponse> GetByIdAsync(Guid id);
    Task<ProductDetailResponse> GetByBarcodeAsync(string barcode);
    Task<ProductResponse> CreateAsync(SaveProductRequest request);
    Task<ProductResponse> UpdateAsync(Guid id, SaveProductRequest request);
    Task DeleteAsync(Guid id);
    Task AddBarcodeAsync(Guid productId, string barcode);
    Task DeleteBarcodeAsync(string barcode);
}
