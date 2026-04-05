namespace Stockly.Infrastructure.Printing;

/// <summary>
/// Découverte des imprimantes IPP sur le réseau local via mDNS (_ipp._tcp.local).
/// À implémenter avec Makaretu.Dns.Multicast (pure C#, cross-platform).
/// </summary>
public class PrinterDiscoveryService
{
    public Task<IReadOnlyList<DiscoveredPrinter>> DiscoverAsync(CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Printer discovery not yet implemented.");
    }
}

public record DiscoveredPrinter(string Name, string IpAddress, int Port);
