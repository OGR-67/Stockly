using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
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

        return services;
    }
}
