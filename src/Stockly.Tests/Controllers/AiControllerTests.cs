using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Stockly.API.Controllers;
using Stockly.Application.DTOs.Ai;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Tests.Controllers;

public class AiControllerTests
{
    private readonly IAIServiceResolver _resolver = Substitute.For<IAIServiceResolver>();
    private readonly IAIService _aiService = Substitute.For<IAIService>();
    private readonly AiController _sut;

    public AiControllerTests()
    {
        _sut = new AiController(_resolver);
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
}
