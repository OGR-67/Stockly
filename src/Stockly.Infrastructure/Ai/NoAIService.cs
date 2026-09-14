using Stockly.Application.DTOs.Ai;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Ai;

public class NoAIService : IAIService
{
    public Task<IReadOnlyList<ReceiptItem>> ParseReceiptAsync(Stream imageStream, CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<ReceiptItem>>([]);

    public Task<IReadOnlyList<ShelfItem>> RecognizeShelfAsync(Stream imageStream, Guid locationId, CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<ShelfItem>>([]);

    public Task<AiConnectionTestResult> TestConnectionAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(new AiConnectionTestResult(false, "Aucun fournisseur IA configuré."));
}
