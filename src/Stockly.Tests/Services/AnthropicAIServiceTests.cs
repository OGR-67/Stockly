using Anthropic.Models.Messages;
using Stockly.Application.Exceptions;
using Stockly.Infrastructure.Ai;

namespace Stockly.Tests.Services;

// Ne teste que la logique de mapping JSON -> DTO (pure, indépendante du réseau) plutôt que
// l'appel HTTP complet : reconstruire un Anthropic.Models.Messages.Message à la main serait
// couplé à la surface interne (souvent volumineuse et changeante) du SDK, pas à notre logique.
public class AnthropicAIServiceTests
{
    [Fact]
    public void MapReceiptResponse_MapsFieldsAndParsesIdsAndDate()
    {
        var productId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var json = $$"""
            {"items":[{"productName":"Camembert","quantity":2,"matchedProductId":"{{productId}}","suggestedLocationId":"{{locationId}}","suggestedExpiration":"2026-10-01"}]}
            """;

        var result = AnthropicAIService.MapReceiptResponse(json);

        var item = Assert.Single(result);
        Assert.Equal("Camembert", item.ProductName);
        Assert.Equal(2, item.Quantity);
        Assert.Equal(productId, item.MatchedProductId);
        Assert.Equal(locationId, item.SuggestedLocationId);
        Assert.Equal(new DateOnly(2026, 10, 1), item.SuggestedExpiration);
    }

    [Fact]
    public void MapReceiptResponse_WithUnparsableIdsAndDate_LeavesThemNull()
    {
        var json = """{"items":[{"productName":"Article inconnu","quantity":1,"matchedProductId":"pas-un-guid","suggestedLocationId":null,"suggestedExpiration":"pas-une-date"}]}""";

        var result = AnthropicAIService.MapReceiptResponse(json);

        var item = Assert.Single(result);
        Assert.Null(item.MatchedProductId);
        Assert.Null(item.SuggestedLocationId);
        Assert.Null(item.SuggestedExpiration);
    }

    [Fact]
    public void MapReceiptResponse_WithMultipleItems_MapsAllOfThem()
    {
        var json = """{"items":[{"productName":"Pain","quantity":1},{"productName":"Lait","quantity":6}]}""";

        var result = AnthropicAIService.MapReceiptResponse(json);

        Assert.Equal(2, result.Count);
        Assert.Equal("Pain", result[0].ProductName);
        Assert.Equal("Lait", result[1].ProductName);
    }

    [Theory]
    [InlineData("ceci n'est pas du JSON")]
    [InlineData("")]
    [InlineData("{}")]
    [InlineData("""{"items": null}""")]
    public void MapReceiptResponse_WithInvalidOrIncompletePayload_ThrowsAiServiceException(string json)
    {
        Assert.Throws<AiServiceException>(() => AnthropicAIService.MapReceiptResponse(json));
    }

    [Fact]
    public void MapShelfResponse_MapsFieldsAndParsesId()
    {
        var productId = Guid.NewGuid();
        var json = $$"""{"items":[{"productName":"Yaourts","matchedProductId":"{{productId}}"}]}""";

        var result = AnthropicAIService.MapShelfResponse(json);

        var item = Assert.Single(result);
        Assert.Equal("Yaourts", item.ProductName);
        Assert.Equal(productId, item.MatchedProductId);
    }

    [Fact]
    public void MapShelfResponse_WithNoMatch_LeavesMatchedProductIdNull()
    {
        var json = """{"items":[{"productName":"Produit inconnu","matchedProductId":null}]}""";

        var result = AnthropicAIService.MapShelfResponse(json);

        Assert.Null(Assert.Single(result).MatchedProductId);
    }

    [Theory]
    [InlineData("pas du JSON du tout")]
    [InlineData("{}")]
    public void MapShelfResponse_WithInvalidOrIncompletePayload_ThrowsAiServiceException(string json)
    {
        Assert.Throws<AiServiceException>(() => AnthropicAIService.MapShelfResponse(json));
    }

    [Theory]
    [InlineData("image/jpeg", MediaType.ImageJpeg)]
    [InlineData("image/jpg", MediaType.ImageJpeg)]
    [InlineData("image/png", MediaType.ImagePng)]
    [InlineData("image/gif", MediaType.ImageGif)]
    [InlineData("image/webp", MediaType.ImageWebP)]
    [InlineData("IMAGE/PNG", MediaType.ImagePng)]
    [InlineData(null, MediaType.ImageJpeg)]
    [InlineData("", MediaType.ImageJpeg)]
    [InlineData("application/octet-stream", MediaType.ImageJpeg)]
    public void ResolveMediaType_MapsKnownContentTypes(string? contentType, MediaType expected)
    {
        Assert.Equal(expected, AnthropicAIService.ResolveMediaType(contentType));
    }

    [Theory]
    [InlineData("image/heic")]
    [InlineData("image/heif")]
    public void ResolveMediaType_WithHeic_ThrowsAiServiceExceptionWithActionableMessage(string contentType)
    {
        var ex = Assert.Throws<AiServiceException>(() => AnthropicAIService.ResolveMediaType(contentType));
        Assert.Contains("HEIC", ex.Message);
    }
}
