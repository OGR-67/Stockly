using Stockly.Application.DTOs.Ai;

namespace Stockly.Application.Interfaces.Services;

public interface IAIService
{
    Task<IReadOnlyList<ReceiptItem>> ParseReceiptAsync(Stream imageStream, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ShelfItem>> RecognizeShelfAsync(Stream imageStream, Guid locationId, CancellationToken cancellationToken = default);
}
