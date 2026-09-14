using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.Settings;

/// <summary>
/// <paramref name="AiApiKey"/> à <c>null</c> conserve la clé actuelle ; une chaîne vide l'efface.
/// <paramref name="AiModel"/> à <c>null</c> ou vide conserve le modèle actuel.
/// </summary>
public record SaveSettingsRequest(AiProvider AiProvider, string? AiApiKey, string? AiModel);
