using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.Settings;

/// <summary>
/// Ne renvoie jamais la clé API en clair — seulement si une clé est actuellement configurée.
/// </summary>
public record SettingsResponse(Guid Id, AiProvider AiProvider, bool HasAiApiKey);
