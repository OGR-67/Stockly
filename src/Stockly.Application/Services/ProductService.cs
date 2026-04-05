using Stockly.Application.DTOs.Categories;
using Stockly.Application.DTOs.Products;
using Stockly.Application.Exceptions;
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

    public async Task<ProductDetailResponse> GetByIdAsync(Guid id)
    {
        var product = await repository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException($"Product {id} not found.");
        return ToDetailResponse(product);
    }

    public async Task<ProductDetailResponse> GetByBarcodeAsync(string barcode)
    {
        var product = await repository.GetByBarcodeAsync(barcode)
            ?? throw new NotFoundException($"Product with barcode '{barcode}' not found.");
        return ToDetailResponse(product);
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

    public async Task<ProductResponse> UpdateAsync(Guid id, SaveProductRequest request)
    {
        var existing = await repository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException($"Product {id} not found.");

        existing.CategoryId = request.CategoryId;
        existing.Name = request.Name;
        existing.FreeText = request.FreeText;

        var updated = await repository.UpdateAsync(existing);
        return ToResponse(updated);
    }

    public async Task DeleteAsync(Guid id)
    {
        _ = await repository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException($"Product {id} not found.");
        await repository.DeleteAsync(id);
    }

    public async Task AddBarcodeAsync(Guid productId, string barcode)
    {
        _ = await repository.GetByIdWithDetailsAsync(productId)
            ?? throw new NotFoundException($"Product {productId} not found.");
        await repository.AddBarcodeAsync(productId, barcode);
    }

    public async Task DeleteBarcodeAsync(string barcode)
    {
        await repository.DeleteBarcodeAsync(barcode);
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
