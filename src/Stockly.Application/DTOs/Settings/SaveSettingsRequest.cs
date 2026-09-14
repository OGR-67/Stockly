using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.Settings;

/// <summary>
/// <paramref name="AiApiKey"/> à <c>null</c> conserve la clé actuelle ; une chaîne vide l'efface.
/// </summary>
public record SaveSettingsRequest(AiProvider AiProvider, string? AiApiKey);
