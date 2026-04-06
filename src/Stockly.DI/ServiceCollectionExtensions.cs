using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stockly.Application;
using Stockly.Infrastructure;

namespace Stockly.DI;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddStocklyServices(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddApplication()
            .AddInfrastructure(configuration);

        return services;
    }
}
