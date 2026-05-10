using Microsoft.Extensions.DependencyInjection;
using Stockly.Application.Interfaces.Services;
using Stockly.Application.Services;

namespace Stockly.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IStorageLocationService, StorageLocationService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IStockUnitService, StockUnitService>();
        services.AddScoped<IPrinterService, PrinterService>();
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<IGroceryListService, GroceryListService>();

        return services;
    }
}
