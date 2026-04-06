using Stockly.Application.Interfaces.Services;
using Zeroconf;

namespace Stockly.Infrastructure.Printing;

public class PrinterDiscoveryService : IPrinterDiscoveryService
{
    public async Task<IReadOnlyList<DiscoveredPrinterDto>> DiscoverAsync(CancellationToken cancellationToken = default)
    {
        var results = await ZeroconfResolver.ResolveAsync("_ipp._tcp.local.", cancellationToken: cancellationToken);

        return results
            .Select(host =>
            {
                var service = host.Services.Values.FirstOrDefault();
                var port = service?.Port ?? 631;
                return new DiscoveredPrinterDto(host.DisplayName, host.IPAddress, port);
            })
            .ToList();
    }
}
