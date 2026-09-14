using NSubstitute;
using Stockly.Application.Exceptions;
using Stockly.Application.DTOs.Categories;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Services;

public class CategoryServiceTests
{
    private readonly ICategoryRepository _repository = Substitute.For<ICategoryRepository>();
    private readonly CategoryService _sut;

    public CategoryServiceTests()
    {
        _sut = new CategoryService(_repository);
    }

    private static Category CreateCategory(Guid id) => new()
    {
        Id = id,
        Name = "Produits laitiers",
        IsPerishable = true,
        IsFresh = true,
        DefaultClosedDays = 30,
        DefaultOpenedDays = 5,
        DefaultFrozenDays = 90,
        FreeText = null,
        MinStockUnits = 2
    };

    private static SaveCategoryRequest CreateRequest() => new(
        "Produits laitiers", true, true, 30, 5, 90, null, 2
    );

    [Fact]
    public async Task GetAllAsync_ReturnsAllCategoriesAsResponses()
    {
        var categories = new[] { CreateCategory(Guid.NewGuid()), CreateCategory(Guid.NewGuid()) };
        _repository.GetAllAsync().Returns(categories);

        var result = await _sut.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_WhenCategoryExists_ReturnsResponse()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id).Returns(CreateCategory(id));

        var result = await _sut.GetByIdAsync(id);

        Assert.Equal(id, result.Id);
        Assert.Equal("Produits laitiers", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_WhenCategoryMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdAsync(Arg.Any<Guid>()).Returns((Category?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task CreateAsync_PersistsNewCategoryWithGeneratedId()
    {
        _repository.CreateAsync(Arg.Any<Category>()).Returns(ci => ci.Arg<Category>());

        var result = await _sut.CreateAsync(CreateRequest());

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Produits laitiers", result.Name);
        await _repository.Received(1).CreateAsync(Arg.Is<Category>(c => c.Name == "Produits laitiers"));
    }

    [Fact]
    public async Task UpdateAsync_WhenCategoryExists_UpdatesFields()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id).Returns(CreateCategory(id));
        _repository.UpdateAsync(Arg.Any<Category>()).Returns(ci => ci.Arg<Category>());

        var request = CreateRequest() with { Name = "Fromages" };
        var result = await _sut.UpdateAsync(id, request);

        Assert.Equal("Fromages", result.Name);
    }

    [Fact]
    public async Task UpdateAsync_WhenCategoryMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdAsync(Arg.Any<Guid>()).Returns((Category?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.UpdateAsync(Guid.NewGuid(), CreateRequest()));
    }

    [Fact]
    public async Task DeleteAsync_WhenCategoryExists_DeletesIt()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id).Returns(CreateCategory(id));

        await _sut.DeleteAsync(id);

        await _repository.Received(1).DeleteAsync(id);
    }

    [Fact]
    public async Task DeleteAsync_WhenCategoryMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdAsync(Arg.Any<Guid>()).Returns((Category?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(Guid.NewGuid()));
        await _repository.DidNotReceive().DeleteAsync(Arg.Any<Guid>());
    }
}
