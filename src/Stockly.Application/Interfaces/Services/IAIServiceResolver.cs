namespace Stockly.Application.Interfaces.Services;

/// <summary>
/// Résout l'<see cref="IAIService"/> actif selon la configuration persistée (<c>Settings.AiProvider</c>).
/// Résolu à chaque appel (et non une fois au démarrage) pour que le changement de fournisseur en
/// base prenne effet immédiatement, sans redéploiement.
/// </summary>
public interface IAIServiceResolver
{
    Task<IAIService> ResolveAsync(CancellationToken cancellationToken = default);
}
