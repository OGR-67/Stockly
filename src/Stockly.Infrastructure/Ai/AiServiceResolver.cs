using Microsoft.Extensions.DependencyInjection;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Ai;

public class AiServiceResolver(ISettingsRepository settingsRepository, IServiceProvider serviceProvider) : IAIServiceResolver
{
    public async Task<IAIService> ResolveAsync(CancellationToken cancellationToken = default)
    {
        var settings = await settingsRepository.GetAsync();
        return serviceProvider.GetRequiredKeyedService<IAIService>(settings.AiProvider);
    }
}
