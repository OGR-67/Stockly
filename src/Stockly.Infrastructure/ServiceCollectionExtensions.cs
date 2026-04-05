using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Stockly.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Repository and printing service implementations will be registered here.
        return services;
    }
}
