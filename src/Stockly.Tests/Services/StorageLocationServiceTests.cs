using NSubstitute;
using Stockly.Application.DTOs.StorageLocations;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Services;

public class StorageLocationServiceTests
{
    private readonly IStorageLocationRepository _repository = Substitute.For<IStorageLocationRepository>();
    private readonly StorageLocationService _sut;

    public StorageLocationServiceTests()
    {
        _sut = new StorageLocationService(_repository);
    }

    private static StorageLocation CreateLocation(Guid id) => new()
    {
        Id = id,
        Name = "Frigo",
        Type = LocationType.Fridge
    };

    [Fact]
    public async Task GetAllAsync_ReturnsAllLocations()
    {
        _repository.GetAllAsync().Returns([CreateLocation(Guid.NewGuid()), CreateLocation(Guid.NewGuid())]);

        var result = await _sut.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_WhenLocationExists_ReturnsResponse()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id).Returns(CreateLocation(id));

        var result = await _sut.GetByIdAsync(id);

        Assert.Equal(id, result.Id);
        Assert.Equal(LocationType.Fridge, result.Type);
    }

    [Fact]
    public async Task GetByIdAsync_WhenLocationMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdAsync(Arg.Any<Guid>()).Returns((StorageLocation?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task CreateAsync_PersistsNewLocation()
    {
        _repository.CreateAsync(Arg.Any<StorageLocation>()).Returns(ci => ci.Arg<StorageLocation>());

        var result = await _sut.CreateAsync(new SaveStorageLocationRequest("Congélateur", LocationType.Freezer, null));

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal("Congélateur", result.Name);
        Assert.Equal(LocationType.Freezer, result.Type);
    }

    [Fact]
    public async Task CreateAsync_PersistsDescription()
    {
        _repository.CreateAsync(Arg.Any<StorageLocation>()).Returns(ci => ci.Arg<StorageLocation>());

        var result = await _sut.CreateAsync(new SaveStorageLocationRequest(
            "Étagères buanderie", LocationType.Normal, "Stock longue durée : PQ, conserves"));

        Assert.Equal("Stock longue durée : PQ, conserves", result.Description);
    }

    [Fact]
    public async Task UpdateAsync_WhenLocationExists_UpdatesFields()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id).Returns(CreateLocation(id));
        _repository.UpdateAsync(Arg.Any<StorageLocation>()).Returns(ci => ci.Arg<StorageLocation>());

        var result = await _sut.UpdateAsync(id, new SaveStorageLocationRequest("Placard", LocationType.Normal, "Épicerie sèche"));

        Assert.Equal("Placard", result.Name);
        Assert.Equal(LocationType.Normal, result.Type);
        Assert.Equal("Épicerie sèche", result.Description);
    }

    [Fact]
    public async Task UpdateAsync_WhenLocationMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdAsync(Arg.Any<Guid>()).Returns((StorageLocation?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.UpdateAsync(Guid.NewGuid(), new SaveStorageLocationRequest("Placard", LocationType.Normal, null)));
    }

    [Fact]
    public async Task DeleteAsync_WhenLocationExists_DeletesIt()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id).Returns(CreateLocation(id));

        await _sut.DeleteAsync(id);

        await _repository.Received(1).DeleteAsync(id);
    }

    [Fact]
    public async Task DeleteAsync_WhenLocationMissing_ThrowsNotFoundException()
    {
        _repository.GetByIdAsync(Arg.Any<Guid>()).Returns((StorageLocation?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(Guid.NewGuid()));
    }
}
