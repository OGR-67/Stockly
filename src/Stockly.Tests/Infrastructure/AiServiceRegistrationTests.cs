using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Ai;

namespace Stockly.Tests.Infrastructure;

public class AiServiceRegistrationTests
{
    private static IAIService ResolveWithProvider(string? providerValue)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(providerValue is null
                ? []
                : new Dictionary<string, string?> { ["Ai:Provider"] = providerValue })
            .Build();

        var services = new ServiceCollection();
        services.AddKeyedScoped<IAIService, NoAIService>(AiProvider.None);
        services.AddScoped<IAIService>(sp =>
        {
            var provider = Enum.TryParse<AiProvider>(configuration["Ai:Provider"], ignoreCase: true, out var parsed)
                ? parsed
                : AiProvider.None;
            return sp.GetRequiredKeyedService<IAIService>(provider);
        });

        return services.BuildServiceProvider().GetRequiredService<IAIService>();
    }

    [Fact]
    public void Resolve_WithNoConfiguration_ReturnsNoAIService()
    {
        var service = ResolveWithProvider(null);

        Assert.IsType<NoAIService>(service);
    }

    [Fact]
    public void Resolve_WithNoneProvider_ReturnsNoAIService()
    {
        var service = ResolveWithProvider("None");

        Assert.IsType<NoAIService>(service);
    }

    [Fact]
    public void Resolve_WithUnknownProvider_FallsBackToNoAIService()
    {
        var service = ResolveWithProvider("SomethingNotConfiguredYet");

        Assert.IsType<NoAIService>(service);
    }

    [Fact]
    public void Resolve_WithUnregisteredProvider_ThrowsClearError()
    {
        // Anthropic n'est pas encore enregistré (issue #92) : demander ce provider doit échouer
        // explicitement plutôt que de silencieusement retomber sur un autre comportement.
        Assert.Throws<InvalidOperationException>(() => ResolveWithProvider("Anthropic"));
    }
}
