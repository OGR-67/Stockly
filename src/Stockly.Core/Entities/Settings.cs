namespace Stockly.Core.Entities;

/// <summary>
/// Configuration applicative persistée. Ligne singleton : une seule instance existe en base
/// à un instant donné (portée par le repository côté Application).
/// </summary>
public class Settings
{
    public Guid Id { get; set; }
    public AiProvider AiProvider { get; set; } = AiProvider.None;
    public string? AiApiKey { get; set; }
}
