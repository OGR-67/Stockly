using NSubstitute;
using Stockly.Application.DTOs.StockUnits;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Services;

public class StockUnitServiceTests
{
    private readonly IStockUnitRepository _repository = Substitute.For<IStockUnitRepository>();
    private readonly IStorageLocationRepository _locationRepository = Substitute.For<IStorageLocationRepository>();
    private readonly StockUnitService _sut;

    public StockUnitServiceTests()
    {
        _sut = new StockUnitService(_repository, _locationRepository);
    }

    private static Category CreateCategory(bool isPerishable = true, int? defaultFrozenDays = 90) => new()
    {
        Id = Guid.NewGuid(),
        Name = "Viandes",
        IsPerishable = isPerishable,
        DefaultFrozenDays = defaultFrozenDays
    };

    private static Product CreateProduct(Category category) => new()
    {
        Id = Guid.NewGuid(),
        CategoryId = category.Id,
        Name = "Poulet",
        Category = category
    };

    private static StorageLocation CreateLocation(LocationType type) => new()
    {
        Id = Guid.NewGuid(),
        Name = type.ToString(),
        Type = type
    };

    private static StockUnit CreateStockUnit(Product product, StorageLocation location) => new()
    {
        Id = Guid.NewGuid(),
        ProductId = product.Id,
        LocationId = location.Id,
        Product = product,
        Location = location,
        CreatedAt = DateTime.UtcNow
    };

    [Fact]
    public async Task GetAllAsync_ReturnsAllUnits()
    {
        var category = CreateCategory();
        var product = CreateProduct(category);
        var location = CreateLocation(LocationType.Fridge);
        _repository.GetAllWithDetailsAsync().Returns([CreateStockUnit(product, location), CreateStockUnit(product, location)]);

        var result = await _sut.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByLocationAsync_ReturnsUnitsForLocation()
    {
        var category = CreateCategory();
        var product = CreateProduct(category);
        var location = CreateLocation(LocationType.Fridge);
        _repository.GetByLocationWithDetailsAsync(location.Id).Returns([CreateStockUnit(product, location)]);

        var result = await _sut.GetByLocationAsync(location.Id);

        Assert.Single(result);
    }

    [Fact]
    public async Task AddAsync_CreatesUnopenedUnit()
    {
        var category = CreateCategory();
        var product = CreateProduct(category);
        var location = CreateLocation(LocationType.Fridge);
        var request = new CreateStockUnitRequest(product.Id, location.Id, null, null);

        _repository.CreateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());
        _repository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns(CreateStockUnit(product, location));

        var result = await _sut.AddAsync(request);

        Assert.False(result.IsOpened);
        Assert.Null(result.OpenedAt);
        Assert.Null(result.ConsumedAt);
    }

    [Fact]
    public async Task UpdateAsync_WhenUnitExists_UpdatesExpirationAndFreeText()
    {
        var category = CreateCategory();
        var product = CreateProduct(category);
        var location = CreateLocation(LocationType.Fridge);
        var unit = CreateStockUnit(product, location);
        _repository.GetByIdWithDetailsAsync(unit.Id).Returns(unit);
        _repository.UpdateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());

        var expiration = DateTime.UtcNow.AddDays(10);
        var result = await _sut.UpdateAsync(unit.Id, new UpdateStockUnitRequest(expiration, "Reste de dinde"));

        Assert.Equal(expiration, result.ExpirationDate);
        Assert.Equal("Reste de dinde", result.FreeText);
    }

    [Fact]
    public async Task UpdateAsync_WhenUnitMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns((StockUnit?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.UpdateAsync(Guid.NewGuid(), new UpdateStockUnitRequest(null, null)));
    }

    [Fact]
    public async Task OpenAsync_MarksUnitAsOpened()
    {
        var category = CreateCategory();
        var product = CreateProduct(category);
        var location = CreateLocation(LocationType.Fridge);
        var unit = CreateStockUnit(product, location);
        _repository.GetByIdWithDetailsAsync(unit.Id).Returns(unit);
        _repository.UpdateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());

        var result = await _sut.OpenAsync(unit.Id);

        Assert.True(result.IsOpened);
        Assert.NotNull(result.OpenedAt);
    }

    [Fact]
    public async Task ConsumeAsync_SetsConsumedAt()
    {
        var category = CreateCategory();
        var product = CreateProduct(category);
        var location = CreateLocation(LocationType.Fridge);
        var unit = CreateStockUnit(product, location);
        _repository.GetByIdWithDetailsAsync(unit.Id).Returns(unit);
        _repository.UpdateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());

        var result = await _sut.ConsumeAsync(unit.Id);

        Assert.NotNull(result.ConsumedAt);
    }

    [Fact]
    public async Task DeleteAsync_WhenUnitExists_DeletesIt()
    {
        var category = CreateCategory();
        var product = CreateProduct(category);
        var location = CreateLocation(LocationType.Fridge);
        var unit = CreateStockUnit(product, location);
        _repository.GetByIdAsync(unit.Id).Returns(unit);

        await _sut.DeleteAsync(unit.Id);

        await _repository.Received(1).DeleteAsync(unit.Id);
    }

    [Fact]
    public async Task DeleteAsync_WhenUnitMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdAsync(Arg.Any<Guid>()).Returns((StockUnit?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task MoveAsync_ToFreezer_SetsExpirationFromCategoryDefaultFrozenDays()
    {
        var category = CreateCategory(isPerishable: true, defaultFrozenDays: 90);
        var product = CreateProduct(category);
        var fridge = CreateLocation(LocationType.Fridge);
        var freezer = CreateLocation(LocationType.Freezer);
        var unit = CreateStockUnit(product, fridge);

        _repository.GetByIdWithDetailsAsync(unit.Id).Returns(unit);
        _locationRepository.GetByIdAsync(freezer.Id).Returns(freezer);
        _repository.UpdateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());

        var before = DateTime.UtcNow;
        var result = await _sut.MoveAsync(unit.Id, new MoveStockUnitRequest(freezer.Id));

        Assert.Equal(freezer.Id, result.LocationId);
        Assert.NotNull(result.ExpirationDate);
        Assert.True(result.ExpirationDate > before.AddDays(89) && result.ExpirationDate < before.AddDays(91));
    }

    [Fact]
    public async Task MoveAsync_FromFreezerToNonFreezer_SetsExpirationToTomorrow()
    {
        var category = CreateCategory(isPerishable: true);
        var product = CreateProduct(category);
        var freezer = CreateLocation(LocationType.Freezer);
        var fridge = CreateLocation(LocationType.Fridge);
        var unit = CreateStockUnit(product, freezer);

        _repository.GetByIdWithDetailsAsync(unit.Id).Returns(unit);
        _locationRepository.GetByIdAsync(fridge.Id).Returns(fridge);
        _repository.UpdateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());

        var before = DateTime.UtcNow;
        var result = await _sut.MoveAsync(unit.Id, new MoveStockUnitRequest(fridge.Id));

        Assert.NotNull(result.ExpirationDate);
        Assert.True(result.ExpirationDate > before.AddHours(23) && result.ExpirationDate < before.AddHours(25));
    }

    [Fact]
    public async Task MoveAsync_BetweenNonFreezerLocations_DoesNotChangeExpiration()
    {
        var category = CreateCategory(isPerishable: true);
        var product = CreateProduct(category);
        var fridge = CreateLocation(LocationType.Fridge);
        var cupboard = CreateLocation(LocationType.Normal);
        var unit = CreateStockUnit(product, fridge);
        unit.ExpirationDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        _repository.GetByIdWithDetailsAsync(unit.Id).Returns(unit);
        _locationRepository.GetByIdAsync(cupboard.Id).Returns(cupboard);
        _repository.UpdateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());

        var result = await _sut.MoveAsync(unit.Id, new MoveStockUnitRequest(cupboard.Id));

        Assert.Equal(unit.ExpirationDate, result.ExpirationDate);
    }

    [Fact]
    public async Task MoveAsync_WhenProductNotPerishable_DoesNotChangeExpiration()
    {
        var category = CreateCategory(isPerishable: false);
        var product = CreateProduct(category);
        var fridge = CreateLocation(LocationType.Fridge);
        var freezer = CreateLocation(LocationType.Freezer);
        var unit = CreateStockUnit(product, fridge);

        _repository.GetByIdWithDetailsAsync(unit.Id).Returns(unit);
        _locationRepository.GetByIdAsync(freezer.Id).Returns(freezer);
        _repository.UpdateAsync(Arg.Any<StockUnit>()).Returns(ci => ci.Arg<StockUnit>());

        var result = await _sut.MoveAsync(unit.Id, new MoveStockUnitRequest(freezer.Id));

        Assert.Null(result.ExpirationDate);
    }

    [Fact]
    public async Task MoveAsync_WhenUnitMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdWithDetailsAsync(Arg.Any<Guid>()).Returns((StockUnit?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.MoveAsync(Guid.NewGuid(), new MoveStockUnitRequest(Guid.NewGuid())));
    }
}
