using Stockly.Infrastructure.Ai;

namespace Stockly.Tests.Services;

public class NoAIServiceTests
{
    private readonly NoAIService _sut = new();

    [Fact]
    public async Task ParseReceiptAsync_ReturnsEmptyList()
    {
        using var stream = new MemoryStream();

        var result = await _sut.ParseReceiptAsync(stream, "image/jpeg");

        Assert.Empty(result);
    }

    [Fact]
    public async Task ParseReceiptAsync_WithEmptyStream_DoesNotThrow()
    {
        using var stream = new MemoryStream([]);

        var exception = await Record.ExceptionAsync(() => _sut.ParseReceiptAsync(stream, "image/jpeg"));

        Assert.Null(exception);
    }

    [Fact]
    public async Task RecognizeShelfAsync_ReturnsEmptyList()
    {
        using var stream = new MemoryStream();

        var result = await _sut.RecognizeShelfAsync(stream, "image/jpeg", Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task TestConnectionAsync_ReturnsFailureWithoutThrowing()
    {
        var result = await _sut.TestConnectionAsync();

        Assert.False(result.Success);
        Assert.NotNull(result.ErrorMessage);
    }
}
