using NSubstitute;
using Stockly.Application.DTOs.Products;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Services;

public class ProductServiceTests
{
    private readonly IProductRepository _repository = Substitute.For<IProductRepository>();
    private readonly ProductService _sut;

    public ProductServiceTests()
    {
        _sut = new ProductService(_repository);
    }

    private static Category CreateCategory() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Fromages",
        IsPerishable = true,
        IsFresh = true
    };

    private static Product CreateProduct(Guid id, Category? category = null) => new()
    {
        Id = id,
        CategoryId = category?.Id ?? Guid.NewGuid(),
        Name = "Camembert",
        Category = category ?? CreateCategory(),
        Barcodes = []
    };

    private static SaveProductRequest CreateRequest(Guid categoryId) => new(
        categoryId, "Camembert", null, null
    );

    [Fact]
    public async Task GetAllAsync_ReturnsAllProducts()
    {
        _repository.GetAllWithDetailsAsync().Returns([CreateProduct(Guid.NewGuid()), CreateProduct(Guid.NewGuid())]);

        var result = await _sut.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_WhenProductExists_ReturnsDetailResponse()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdWithDetailsAsync(id).Returns(CreateProduct(id));

        var result = await _sut.GetByIdAsync(id);

        Assert.Equal(id, result.Id);
    }

    [Fact]
    public async Task GetByIdAsync_WhenProductMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task GetByBarcodeAsync_WhenFound_ReturnsDetailResponse()
    {
        var product = CreateProduct(Guid.NewGuid());
        _repository.GetByBarcodeAsync("123").Returns(product);

        var result = await _sut.GetByBarcodeAsync("123");

        Assert.Equal(product.Id, result.Id);
    }

    [Fact]
    public async Task GetByBarcodeAsync_WhenNotFound_ThrowsNotFoundException()
    {
        _repository.GetByBarcodeAsync(Arg.Any<string>()).Returns((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByBarcodeAsync("unknown"));
    }

    [Fact]
    public async Task CreateAsync_PersistsNewProduct()
    {
        var categoryId = Guid.NewGuid();
        _repository.CreateAsync(Arg.Any<Product>()).Returns(ci => ci.Arg<Product>());

        var result = await _sut.CreateAsync(CreateRequest(categoryId));

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(categoryId, result.CategoryId);
    }

    [Fact]
    public async Task UpdateAsync_WhenProductExists_UpdatesFields()
    {
        var id = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        _repository.GetByIdWithDetailsAsync(id).Returns(CreateProduct(id));
        _repository.UpdateAsync(Arg.Any<Product>()).Returns(ci => ci.Arg<Product>());

        var result = await _sut.UpdateAsync(id, CreateRequest(categoryId) with { Name = "Brie" });

        Assert.Equal("Brie", result.Name);
        Assert.Equal(categoryId, result.CategoryId);
    }

    [Fact]
    public async Task UpdateAsync_WhenProductMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.UpdateAsync(Guid.NewGuid(), CreateRequest(Guid.NewGuid())));
    }

    [Fact]
    public async Task DeleteAsync_WhenProductExists_DeletesIt()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdWithDetailsAsync(id).Returns(CreateProduct(id));

        await _sut.DeleteAsync(id);

        await _repository.Received(1).DeleteAsync(id);
    }

    [Fact]
    public async Task DeleteAsync_WhenProductMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task AddBarcodeAsync_WhenProductExists_AddsBarcode()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdWithDetailsAsync(id).Returns(CreateProduct(id));

        await _sut.AddBarcodeAsync(id, "1234567890");

        await _repository.Received(1).AddBarcodeAsync(id, "1234567890");
    }

    [Fact]
    public async Task AddBarcodeAsync_WhenProductMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.AddBarcodeAsync(Guid.NewGuid(), "1234567890"));
        await _repository.DidNotReceive().AddBarcodeAsync(Arg.Any<Guid>(), Arg.Any<string>());
    }

    [Fact]
    public async Task DeleteBarcodeAsync_DelegatesToRepository()
    {
        await _sut.DeleteBarcodeAsync("1234567890");

        await _repository.Received(1).DeleteBarcodeAsync("1234567890");
    }
}
