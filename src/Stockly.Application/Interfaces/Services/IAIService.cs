using Stockly.Application.DTOs.Ai;

namespace Stockly.Application.Interfaces.Services;

public interface IAIService
{
    Task<IReadOnlyList<ReceiptItem>> ParseReceiptAsync(Stream imageStream, string imageContentType, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ShelfItem>> RecognizeShelfAsync(Stream imageStream, string imageContentType, Guid locationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Vérifie qu'on peut effectivement joindre le fournisseur configuré (ex: clé API valide),
    /// sans lever d'exception — le résultat porte le succès/échec pour affichage direct en UI.
    /// </summary>
    Task<AiConnectionTestResult> TestConnectionAsync(CancellationToken cancellationToken = default);
}
