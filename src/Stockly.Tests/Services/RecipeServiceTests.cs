using NSubstitute;
using Stockly.Application.DTOs.Recipes;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Services;

public class RecipeServiceTests
{
    private readonly IRecipeRepository _repository = Substitute.For<IRecipeRepository>();
    private readonly IProductRepository _productRepository = Substitute.For<IProductRepository>();
    private readonly RecipeService _sut;

    public RecipeServiceTests()
    {
        _sut = new RecipeService(_repository, _productRepository);
    }

    private static Product CreateProduct(Guid id) => new()
    {
        Id = id,
        CategoryId = Guid.NewGuid(),
        Name = "Farine",
        Category = new Category { Id = Guid.NewGuid(), Name = "Épicerie" }
    };

    private static Recipe CreateRecipe(Guid id, IEnumerable<Product> products) => new()
    {
        Id = id,
        Name = "Gâteau au yaourt",
        Type = RecipeType.Dessert,
        Products = products.ToList()
    };

    [Fact]
    public async Task GetAllAsync_ReturnsAllRecipes()
    {
        _repository.GetAllAsync().Returns([CreateRecipe(Guid.NewGuid(), []), CreateRecipe(Guid.NewGuid(), [])]);

        var result = await _sut.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_WithKnownProducts_CreatesRecipeWithProducts()
    {
        var productId = Guid.NewGuid();
        var product = CreateProduct(productId);
        _productRepository.GetByIdWithDetailsAsync(productId).Returns(product);
        _repository.CreateAsync(Arg.Any<Recipe>()).Returns(ci => ci.Arg<Recipe>());

        var request = new SaveRecipeRequest("Gâteau au yaourt", RecipeType.Dessert, null, [productId]);
        var result = await _sut.CreateAsync(request);

        Assert.Single(result.Products);
        Assert.Equal(productId, result.Products.Single().Id);
    }

    [Fact]
    public async Task CreateAsync_WithUnknownProduct_ThrowsNotFoundException()
    {
        _productRepository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns((Product?)null);

        var request = new SaveRecipeRequest("Gâteau au yaourt", RecipeType.Dessert, null, [Guid.NewGuid()]);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.CreateAsync(request));
        await _repository.DidNotReceive().CreateAsync(Arg.Any<Recipe>());
    }

    [Fact]
    public async Task UpdateAsync_WhenRecipeExists_UpdatesFieldsAndProducts()
    {
        var id = Guid.NewGuid();
        var oldProductId = Guid.NewGuid();
        var newProductId = Guid.NewGuid();
        _repository.GetByIdWithProductsAsync(id).Returns(CreateRecipe(id, [CreateProduct(oldProductId)]));
        _productRepository.GetByIdWithDetailsAsync(newProductId).Returns(CreateProduct(newProductId));
        _repository.UpdateAsync(Arg.Any<Recipe>()).Returns(ci => ci.Arg<Recipe>());

        var request = new SaveRecipeRequest("Gâteau au chocolat", RecipeType.Dessert, null, [newProductId]);
        var result = await _sut.UpdateAsync(id, request);

        Assert.Equal("Gâteau au chocolat", result.Name);
        Assert.Single(result.Products);
        Assert.Equal(newProductId, result.Products.Single().Id);
    }

    [Fact]
    public async Task UpdateAsync_WhenRecipeMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithProductsAsync(Arg.Any<Guid>()).Returns((Recipe?)null);

        var request = new SaveRecipeRequest("Gâteau", RecipeType.Dessert, null, []);
        await Assert.ThrowsAsync<NotFoundException>(() => _sut.UpdateAsync(Guid.NewGuid(), request));
    }

    [Fact]
    public async Task DeleteAsync_WhenRecipeExists_DeletesIt()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdWithProductsAsync(id).Returns(CreateRecipe(id, []));

        await _sut.DeleteAsync(id);

        await _repository.Received(1).DeleteAsync(id);
    }

    [Fact]
    public async Task DeleteAsync_WhenRecipeMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithProductsAsync(Arg.Any<Guid>()).Returns((Recipe?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(Guid.NewGuid()));
    }
}
