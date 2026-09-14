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

        services.AddScoped<IPrintingService, CupsPrintingService>();
        services.AddScoped<IPrinterDiscoveryService, CupsDiscoveryService>();

        services.AddAiServices(configuration);

        return services;
    }

    /// <summary>
    /// Strategy pattern piloté par <see cref="AiProvider"/> : chaque fournisseur est enregistré comme
    /// service à clé, et l'implémentation exposée en <see cref="IAIService"/> est résolue une fois selon
    /// la configuration. Ajouter un fournisseur ne demande qu'un AddKeyedScoped supplémentaire ici.
    /// </summary>
    private static IServiceCollection AddAiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddKeyedScoped<IAIService, NoAIService>(AiProvider.None);
        // AnthropicAIService sera enregistré ici sous la clé AiProvider.Anthropic (issue #92).

        services.AddScoped<IAIService>(sp =>
        {
            var provider = Enum.TryParse<AiProvider>(configuration["Ai:Provider"], ignoreCase: true, out var parsed)
                ? parsed
                : AiProvider.None;
            return sp.GetRequiredKeyedService<IAIService>(provider);
        });

        return services;
    }
}
