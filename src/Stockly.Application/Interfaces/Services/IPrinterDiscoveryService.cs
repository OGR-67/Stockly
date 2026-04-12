namespace Stockly.Application.Interfaces.Services;

public interface IPrinterDiscoveryService
{
    Task<IReadOnlyList<DiscoveredPrinterDto>> DiscoverAsync(CancellationToken cancellationToken = default);
}

public record DiscoveredPrinterDto(string Name, string QueueName, int Port);
