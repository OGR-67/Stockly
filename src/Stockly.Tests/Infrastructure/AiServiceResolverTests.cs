using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using Stockly.Application.DTOs.Ai;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Ai;

namespace Stockly.Tests.Infrastructure;

public class AiServiceResolverTests
{
    private class FakeAIService : IAIService
    {
        public Task<IReadOnlyList<ReceiptItem>> ParseReceiptAsync(Stream imageStream, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<ReceiptItem>>([]);

        public Task<IReadOnlyList<ShelfItem>> RecognizeShelfAsync(Stream imageStream, Guid locationId, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<ShelfItem>>([]);

        public Task<AiConnectionTestResult> TestConnectionAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(new AiConnectionTestResult(true, null));
    }

    private static IAIServiceResolver BuildResolver(Settings settings, bool registerAnthropic)
    {
        var settingsRepository = Substitute.For<ISettingsRepository>();
        settingsRepository.GetAsync().Returns(settings);

        var services = new ServiceCollection();
        services.AddKeyedScoped<IAIService, NoAIService>(AiProvider.None);
        if (registerAnthropic)
            services.AddKeyedScoped<IAIService, FakeAIService>(AiProvider.Anthropic);
        services.AddSingleton(settingsRepository);
        services.AddScoped<IAIServiceResolver, AiServiceResolver>();

        return services.BuildServiceProvider().GetRequiredService<IAIServiceResolver>();
    }

    [Fact]
    public async Task ResolveAsync_WithNoneProvider_ReturnsNoAIService()
    {
        var resolver = BuildResolver(new Settings { AiProvider = AiProvider.None }, registerAnthropic: true);

        var service = await resolver.ResolveAsync();

        Assert.IsType<NoAIService>(service);
    }

    [Fact]
    public async Task ResolveAsync_WithRegisteredProvider_ReturnsThatProvidersImplementation()
    {
        var resolver = BuildResolver(new Settings { AiProvider = AiProvider.Anthropic }, registerAnthropic: true);

        var service = await resolver.ResolveAsync();

        Assert.IsType<FakeAIService>(service);
    }

    [Fact]
    public async Task ResolveAsync_WithUnregisteredProvider_ThrowsClearError()
    {
        // Un provider dont l'implémentation n'est pas (encore) enregistrée doit échouer
        // explicitement plutôt que de silencieusement retomber sur un autre comportement.
        var resolver = BuildResolver(new Settings { AiProvider = AiProvider.Anthropic }, registerAnthropic: false);

        await Assert.ThrowsAsync<InvalidOperationException>(() => resolver.ResolveAsync());
    }
}
