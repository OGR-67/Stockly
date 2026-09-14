using Stockly.Application.DTOs.Settings;

namespace Stockly.Application.Interfaces.Services;

public interface ISettingsService
{
    Task<SettingsResponse> GetAsync();

    Task<SettingsResponse> UpdateAsync(SaveSettingsRequest request);
}
