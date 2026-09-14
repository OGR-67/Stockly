using Stockly.Application.DTOs.Settings;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;
using Stockly.Core.Entities;

namespace Stockly.Application.Services;

public class SettingsService(ISettingsRepository repository) : ISettingsService
{
    public async Task<SettingsResponse> GetAsync()
    {
        var settings = await repository.GetAsync();
        return ToResponse(settings);
    }

    public async Task<SettingsResponse> UpdateAsync(SaveSettingsRequest request)
    {
        var existing = await repository.GetAsync();

        existing.AiProvider = request.AiProvider;
        if (request.AiApiKey is not null)
            existing.AiApiKey = request.AiApiKey.Length == 0 ? null : request.AiApiKey;

        var updated = await repository.UpdateAsync(existing);
        return ToResponse(updated);
    }

    private static SettingsResponse ToResponse(Settings s) =>
        new(s.Id, s.AiProvider, !string.IsNullOrEmpty(s.AiApiKey));
}
