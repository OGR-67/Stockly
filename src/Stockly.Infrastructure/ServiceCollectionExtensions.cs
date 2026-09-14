using Anthropic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Ai;
using Stockly.Infrastructure.Persistence;
using Stockly.Infrastructure.Printing;
using Stockly.Infrastructure.Repositories;

namespace Stockly.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<StocklyDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default")));

        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IStorageLocationRepository, StorageLocationRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IStockUnitRepository, StockUnitRepository>();
        services.AddScoped<IPrinterRepository, PrinterRepository>();
        services.AddScoped<IRecipeRepository, RecipeRepository>();
        services.AddScoped<IGroceryListRepository, GroceryListRepository>();
        services.AddScoped<ISettingsRepository, SettingsRepository>();

        services.AddScoped<IPrintingService, CupsPrintingService>();
        services.AddScoped<IPrinterDiscoveryService, CupsDiscoveryService>();

        services.AddAiServices();

        return services;
    }

    /// <summary>
    /// Strategy pattern piloté par <see cref="AiProvider"/> : chaque fournisseur est enregistré comme
    /// service à clé. <see cref="IAIServiceResolver"/> résout l'implémentation active à chaque appel
    /// selon <c>Settings.AiProvider</c> (persisté en base, modifiable sans redéploiement) — ajouter un
    /// fournisseur ne demande qu'un AddKeyedScoped supplémentaire ici.
    /// </summary>
    private static IServiceCollection AddAiServices(this IServiceCollection services)
    {
        services.AddKeyedScoped<IAIService, NoAIService>(AiProvider.None);

        // La clé API vient de Settings (base), pas de la config statique — elle doit pouvoir
        // changer sans redéploiement. AnthropicClient est donc construit par requête (Scoped).
        services.AddScoped(sp =>
        {
            var settings = sp.GetRequiredService<ISettingsRepository>().GetAsync().GetAwaiter().GetResult();
            return string.IsNullOrWhiteSpace(settings.AiApiKey) ? new AnthropicClient() : new AnthropicClient { ApiKey = settings.AiApiKey };
        });
        services.AddScoped(sp => sp.GetRequiredService<AnthropicClient>().Messages);
        services.AddKeyedScoped<IAIService, AnthropicAIService>(AiProvider.Anthropic);

        services.AddScoped<IAIServiceResolver, AiServiceResolver>();

        return services;
    }
}
