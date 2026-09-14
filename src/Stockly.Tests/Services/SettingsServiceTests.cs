using NSubstitute;
using Stockly.Application.DTOs.Settings;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Services;
using Stockly.Core.Entities;

namespace Stockly.Tests.Services;

public class SettingsServiceTests
{
    private readonly ISettingsRepository _repository = Substitute.For<ISettingsRepository>();
    private readonly SettingsService _sut;

    public SettingsServiceTests()
    {
        _sut = new SettingsService(_repository);
    }

    private static Settings CreateSettings(AiProvider provider = AiProvider.None, string? apiKey = null) => new()
    {
        Id = Guid.NewGuid(),
        AiProvider = provider,
        AiApiKey = apiKey,
    };

    [Fact]
    public async Task GetAsync_WithNoApiKey_ReturnsHasAiApiKeyFalse()
    {
        _repository.GetAsync().Returns(CreateSettings());

        var result = await _sut.GetAsync();

        Assert.False(result.HasAiApiKey);
        Assert.Equal(AiProvider.None, result.AiProvider);
    }

    [Fact]
    public async Task GetAsync_WithApiKey_ReturnsHasAiApiKeyTrue_WithoutLeakingTheKey()
    {
        _repository.GetAsync().Returns(CreateSettings(AiProvider.Anthropic, "sk-secret"));

        var result = await _sut.GetAsync();

        Assert.True(result.HasAiApiKey);
        // SettingsResponse n'expose aucune propriété portant la clé en clair.
        Assert.DoesNotContain("sk-secret", result.ToString());
    }

    [Fact]
    public async Task UpdateAsync_ChangesProvider()
    {
        var settings = CreateSettings();
        _repository.GetAsync().Returns(settings);
        _repository.UpdateAsync(Arg.Any<Settings>()).Returns(ci => ci.Arg<Settings>());

        var result = await _sut.UpdateAsync(new SaveSettingsRequest(AiProvider.Anthropic, null));

        Assert.Equal(AiProvider.Anthropic, result.AiProvider);
    }

    [Fact]
    public async Task UpdateAsync_WithNullApiKey_KeepsExistingKey()
    {
        var settings = CreateSettings(AiProvider.Anthropic, "sk-existing");
        _repository.GetAsync().Returns(settings);
        _repository.UpdateAsync(Arg.Any<Settings>()).Returns(ci => ci.Arg<Settings>());

        await _sut.UpdateAsync(new SaveSettingsRequest(AiProvider.Anthropic, null));

        Assert.Equal("sk-existing", settings.AiApiKey);
    }

    [Fact]
    public async Task UpdateAsync_WithNewApiKey_ReplacesExistingKey()
    {
        var settings = CreateSettings(AiProvider.Anthropic, "sk-old");
        _repository.GetAsync().Returns(settings);
        _repository.UpdateAsync(Arg.Any<Settings>()).Returns(ci => ci.Arg<Settings>());

        var result = await _sut.UpdateAsync(new SaveSettingsRequest(AiProvider.Anthropic, "sk-new"));

        Assert.Equal("sk-new", settings.AiApiKey);
        Assert.True(result.HasAiApiKey);
    }

    [Fact]
    public async Task UpdateAsync_WithEmptyApiKey_ClearsExistingKey()
    {
        var settings = CreateSettings(AiProvider.Anthropic, "sk-existing");
        _repository.GetAsync().Returns(settings);
        _repository.UpdateAsync(Arg.Any<Settings>()).Returns(ci => ci.Arg<Settings>());

        var result = await _sut.UpdateAsync(new SaveSettingsRequest(AiProvider.Anthropic, ""));

        Assert.Null(settings.AiApiKey);
        Assert.False(result.HasAiApiKey);
    }
}
