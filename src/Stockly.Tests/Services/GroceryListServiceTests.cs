using NSubstitute;
using Stockly.Application.DTOs.GroceryList;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Services;

public class GroceryListServiceTests
{
    private readonly IGroceryListRepository _groceryListRepository = Substitute.For<IGroceryListRepository>();
    private readonly IProductRepository _productRepository = Substitute.For<IProductRepository>();
    private readonly IStockUnitRepository _stockUnitRepository = Substitute.For<IStockUnitRepository>();
    private readonly IRecipeRepository _recipeRepository = Substitute.For<IRecipeRepository>();
    private readonly GroceryListService _sut;

    public GroceryListServiceTests()
    {
        _sut = new GroceryListService(_groceryListRepository, _productRepository, _stockUnitRepository, _recipeRepository);

        _stockUnitRepository.GetAllWithDetailsAsync().Returns([]);
        _productRepository.GetAllWithDetailsAsync().Returns([]);
        _recipeRepository.GetByIdsWithProductsAsync(Arg.Any<IEnumerable<Guid>>()).Returns([]);
        _groceryListRepository.ReplaceAsync(Arg.Any<GroceryList>()).Returns(ci => ci.Arg<GroceryList>());
    }

    private static Product CreateProduct(int? minStockUnits = null, int? categoryMinStockUnits = null) => new()
    {
        Id = Guid.NewGuid(),
        CategoryId = Guid.NewGuid(),
        Name = "Lait",
        MinStockUnits = minStockUnits,
        Category = new Category { Id = Guid.NewGuid(), Name = "Crèmerie", MinStockUnits = categoryMinStockUnits }
    };

    private static StockUnit CreateStockUnitFor(Guid productId) => new()
    {
        Id = Guid.NewGuid(),
        ProductId = productId,
        LocationId = Guid.NewGuid(),
        CreatedAt = DateTime.UtcNow
    };

    [Fact]
    public async Task GetCurrentAsync_WhenNoListExists_ReturnsNull()
    {
        _groceryListRepository.GetCurrentAsync().Returns((GroceryList?)null);

        var result = await _sut.GetCurrentAsync();

        Assert.Null(result);
    }

    [Fact]
    public async Task GetCurrentAsync_WhenListExists_ReturnsResponse()
    {
        var product = CreateProduct();
        var list = new GroceryList
        {
            Id = Guid.NewGuid(),
            GeneratedAt = DateTime.UtcNow,
            Items = [new GroceryListItem { Id = Guid.NewGuid(), ProductId = product.Id, Product = product, Source = GroceryListItemSource.Manual }]
        };
        _groceryListRepository.GetCurrentAsync().Returns(list);

        var result = await _sut.GetCurrentAsync();

        Assert.NotNull(result);
        Assert.Single(result!.Items);
    }

    [Fact]
    public async Task GenerateAsync_ProductBelowOwnMinStockUnits_IsAddedWithMinStockSource()
    {
        var product = CreateProduct(minStockUnits: 3);
        _productRepository.GetAllWithDetailsAsync().Returns([product]);
        _stockUnitRepository.GetAllWithDetailsAsync().Returns([CreateStockUnitFor(product.Id)]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest(null, null));

        var item = Assert.Single(result.Items);
        Assert.Equal(GroceryListItemSource.MinStock, item.Source);
        Assert.Equal(2, item.Quantity);
    }

    [Fact]
    public async Task GenerateAsync_ProductBelowCategoryMinStockUnits_UsedAsFallback()
    {
        var product = CreateProduct(minStockUnits: null, categoryMinStockUnits: 2);
        _productRepository.GetAllWithDetailsAsync().Returns([product]);
        _stockUnitRepository.GetAllWithDetailsAsync().Returns([]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest(null, null));

        var item = Assert.Single(result.Items);
        Assert.Equal(GroceryListItemSource.MinStock, item.Source);
        Assert.Equal(2, item.Quantity);
    }

    [Fact]
    public async Task GenerateAsync_ProductWithNoThresholdAndEnoughStock_IsNotAdded()
    {
        var product = CreateProduct(minStockUnits: 2);
        _productRepository.GetAllWithDetailsAsync().Returns([product]);
        _stockUnitRepository.GetAllWithDetailsAsync().Returns([CreateStockUnitFor(product.Id), CreateStockUnitFor(product.Id)]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest(null, null));

        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task GenerateAsync_RecipeProductWithoutThresholdAndNoStock_IsAddedAsRecipeSource()
    {
        var product = CreateProduct();
        var recipe = new Recipe { Id = Guid.NewGuid(), Name = "Crêpes", Products = [product] };
        _productRepository.GetAllWithDetailsAsync().Returns([product]);
        _recipeRepository.GetByIdsWithProductsAsync(Arg.Any<IEnumerable<Guid>>()).Returns([recipe]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest([recipe.Id], null));

        var item = Assert.Single(result.Items);
        Assert.Equal(GroceryListItemSource.Recipe, item.Source);
        Assert.Equal(recipe.Id, item.RecipeId);
    }

    [Fact]
    public async Task GenerateAsync_RecipeProductAlreadyInStock_IsSkipped()
    {
        var product = CreateProduct();
        var recipe = new Recipe { Id = Guid.NewGuid(), Name = "Crêpes", Products = [product] };
        _productRepository.GetAllWithDetailsAsync().Returns([product]);
        _recipeRepository.GetByIdsWithProductsAsync(Arg.Any<IEnumerable<Guid>>()).Returns([recipe]);
        _stockUnitRepository.GetAllWithDetailsAsync().Returns([CreateStockUnitFor(product.Id)]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest([recipe.Id], null));

        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task GenerateAsync_RecipeProductWithMinStockThreshold_IsHandledByMinStockNotRecipe()
    {
        var product = CreateProduct(minStockUnits: 1);
        var recipe = new Recipe { Id = Guid.NewGuid(), Name = "Crêpes", Products = [product] };
        _productRepository.GetAllWithDetailsAsync().Returns([product]);
        _recipeRepository.GetByIdsWithProductsAsync(Arg.Any<IEnumerable<Guid>>()).Returns([recipe]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest([recipe.Id], null));

        var item = Assert.Single(result.Items);
        Assert.Equal(GroceryListItemSource.MinStock, item.Source);
    }

    [Fact]
    public async Task GenerateAsync_ManualProduct_IsAddedAsManualSource()
    {
        var product = CreateProduct();
        _productRepository.GetAllWithDetailsAsync().Returns([product]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest(null, [product.Id]));

        var item = Assert.Single(result.Items);
        Assert.Equal(GroceryListItemSource.Manual, item.Source);
    }

    [Fact]
    public async Task GenerateAsync_ManualProductUnknown_IsIgnored()
    {
        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest(null, [Guid.NewGuid()]));

        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task GenerateAsync_SameProductAsMinStockAndManual_AppearsOncePerSource()
    {
        var product = CreateProduct(minStockUnits: 3);
        _productRepository.GetAllWithDetailsAsync().Returns([product]);
        _stockUnitRepository.GetAllWithDetailsAsync().Returns([]);

        var result = await _sut.GenerateAsync(new GenerateGroceryListRequest(null, [product.Id]));

        Assert.Equal(2, result.Items.Count());
        Assert.Contains(result.Items, i => i.Source == GroceryListItemSource.MinStock);
        Assert.Contains(result.Items, i => i.Source == GroceryListItemSource.Manual);
    }

    [Fact]
    public async Task RemoveItemAsync_DelegatesToRepository()
    {
        var itemId = Guid.NewGuid();

        await _sut.RemoveItemAsync(itemId);

        await _groceryListRepository.Received(1).RemoveItemAsync(itemId);
    }

    [Fact]
    public async Task ClearAsync_DelegatesToRepository()
    {
        await _sut.ClearAsync();

        await _groceryListRepository.Received(1).ClearAsync();
    }
}
