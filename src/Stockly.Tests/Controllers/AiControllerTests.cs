using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Stockly.API.Controllers;
using Stockly.Application.DTOs.Ai;
using Stockly.Application.DTOs.StorageLocations;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Controllers;

public class AiControllerTests
{
    private readonly IAIServiceResolver _resolver = Substitute.For<IAIServiceResolver>();
    private readonly IAIService _aiService = Substitute.For<IAIService>();
    private readonly IStorageLocationService _locationService = Substitute.For<IStorageLocationService>();
    private readonly AiController _sut;

    public AiControllerTests()
    {
        _sut = new AiController(_resolver, _locationService);
        _resolver.ResolveAsync(Arg.Any<CancellationToken>()).Returns(_aiService);
    }

    private static IFormFile CreateImage(int length = 10)
    {
        var file = Substitute.For<IFormFile>();
        file.Length.Returns(length);
        file.OpenReadStream().Returns(new MemoryStream(new byte[length]));
        return file;
    }

    [Fact]
    public async Task ParseReceipt_WithImage_ReturnsOkWithItemsFromResolvedService()
    {
        IReadOnlyList<ReceiptItem> items = [new ReceiptItem("Camembert", 1, null, null, null)];
        _aiService.ParseReceiptAsync(Arg.Any<Stream>(), Arg.Any<CancellationToken>()).Returns(items);

        var result = await _sut.ParseReceipt(CreateImage(), CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(items, okResult.Value);
    }

    [Fact]
    public async Task ParseReceipt_WithNullImage_ReturnsBadRequestWithoutResolvingAiService()
    {
        var result = await _sut.ParseReceipt(null, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
        await _resolver.DidNotReceive().ResolveAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ParseReceipt_WithEmptyImage_ReturnsBadRequestWithoutResolvingAiService()
    {
        var result = await _sut.ParseReceipt(CreateImage(length: 0), CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
        await _resolver.DidNotReceive().ResolveAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RecognizeShelf_WithImageAndKnownLocation_ReturnsOkWithItemsFromResolvedService()
    {
        var locationId = Guid.NewGuid();
        _locationService.GetByIdAsync(locationId).Returns(new StorageLocationResponse(locationId, "Frigo", LocationType.Fridge, null));
        IReadOnlyList<ShelfItem> items = [new ShelfItem("Yaourts", null)];
        _aiService.RecognizeShelfAsync(Arg.Any<Stream>(), locationId, Arg.Any<CancellationToken>()).Returns(items);

        var result = await _sut.RecognizeShelf(CreateImage(), locationId, CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(items, okResult.Value);
    }

    [Fact]
    public async Task RecognizeShelf_WithUnknownLocation_ThrowsNotFoundExceptionWithoutResolvingAiService()
    {
        var locationId = Guid.NewGuid();
        _locationService.GetByIdAsync(locationId).Returns(Task.FromException<StorageLocationResponse>(new NotFoundException("not found")));

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.RecognizeShelf(CreateImage(), locationId, CancellationToken.None));
        await _resolver.DidNotReceive().ResolveAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RecognizeShelf_WithNullImage_ReturnsBadRequestWithoutCheckingLocationOrResolvingAiService()
    {
        var result = await _sut.RecognizeShelf(null, Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
        await _locationService.DidNotReceive().GetByIdAsync(Arg.Any<Guid>());
        await _resolver.DidNotReceive().ResolveAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TestConnection_ReturnsOkWithResultFromResolvedService()
    {
        var testResult = new AiConnectionTestResult(true, null);
        _aiService.TestConnectionAsync(Arg.Any<CancellationToken>()).Returns(testResult);

        var result = await _sut.TestConnection(CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(testResult, okResult.Value);
    }

    [Fact]
    public async Task TestConnection_WithFailure_ReturnsOkWithFailureResult()
    {
        var testResult = new AiConnectionTestResult(false, "Clé API invalide.");
        _aiService.TestConnectionAsync(Arg.Any<CancellationToken>()).Returns(testResult);

        var result = await _sut.TestConnection(CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(testResult, okResult.Value);
    }
}
