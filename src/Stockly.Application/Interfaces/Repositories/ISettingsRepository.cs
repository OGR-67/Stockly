using Stockly.Core.Entities;

namespace Stockly.Application.Interfaces.Repositories;

public interface ISettingsRepository
{
    /// <summary>
    /// Retourne la ligne de configuration singleton, en la créant avec ses valeurs par défaut
    /// si elle n'existe pas encore.
    /// </summary>
    Task<Settings> GetAsync();

    Task<Settings> UpdateAsync(Settings settings);
}
