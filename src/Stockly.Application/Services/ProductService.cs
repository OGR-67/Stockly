using Stockly.Application.DTOs.Categories;
using Stockly.Application.DTOs.Products;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class ProductService(IProductRepository repository) : IProductService
{
    public async Task<IEnumerable<ProductDetailResponse>> GetAllAsync()
    {
        var products = await repository.GetAllWithDetailsAsync();
        return products.Select(ToDetailResponse);
    }

    public async Task<ProductDetailResponse?> GetByIdAsync(Guid id)
    {
        var product = await repository.GetByIdWithDetailsAsync(id);
        return product is null ? null : ToDetailResponse(product);
    }

    public async Task<ProductDetailResponse?> GetByBarcodeAsync(string barcode)
    {
        var product = await repository.GetByBarcodeAsync(barcode);
        return product is null ? null : ToDetailResponse(product);
    }

    public async Task<ProductResponse> CreateAsync(SaveProductRequest request)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name,
            FreeText = request.FreeText
        };
        var created = await repository.CreateAsync(product);
        return ToResponse(created);
    }

    public async Task<ProductResponse?> UpdateAsync(Guid id, SaveProductRequest request)
    {
        var existing = await repository.GetByIdWithDetailsAsync(id);
        if (existing is null) return null;

        existing.CategoryId = request.CategoryId;
        existing.Name = request.Name;
        existing.FreeText = request.FreeText;

        var updated = await repository.UpdateAsync(existing);
        return ToResponse(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await repository.GetByIdWithDetailsAsync(id);
        if (existing is null) return false;
        await repository.DeleteAsync(id);
        return true;
    }

    public async Task<bool> AddBarcodeAsync(Guid productId, string barcode)
    {
        var existing = await repository.GetByIdWithDetailsAsync(productId);
        if (existing is null) return false;
        await repository.AddBarcodeAsync(productId, barcode);
        return true;
    }

    public async Task<bool> DeleteBarcodeAsync(string barcode)
    {
        await repository.DeleteBarcodeAsync(barcode);
        return true;
    }

    private static ProductResponse ToResponse(Product p) => new(p.Id, p.CategoryId, p.Name, p.FreeText);

    private static ProductDetailResponse ToDetailResponse(Product p) => new(
        p.Id,
        p.CategoryId,
        p.Name,
        p.FreeText,
        ToCategoryResponse(p.Category!),
        p.Barcodes.Select(b => new BarcodeResponse(b.Code, b.ProductId))
    );

    private static CategoryResponse ToCategoryResponse(Category c) => new(
        c.Id, c.Name, c.IsPerishable, c.IsFresh,
        c.DefaultClosedDays, c.DefaultOpenedDays, c.DefaultFrozenDays, c.FreeText
    );
}
