using System.Diagnostics;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class CupsDiscoveryService : IPrinterDiscoveryService
{
    public async Task<IReadOnlyList<DiscoveredPrinterDto>> DiscoverAsync(CancellationToken cancellationToken = default)
    {
        var process = Process.Start(new ProcessStartInfo
        {
            FileName = "lpstat",
            Arguments = "-e",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        }) ?? throw new InvalidOperationException("Failed to start lpstat process.");

        await process.WaitForExitAsync(cancellationToken);

        if (process.ExitCode != 0)
        {
            var error = await process.StandardError.ReadToEndAsync(cancellationToken);
            throw new InvalidOperationException($"lpstat failed: {error}");
        }

        var output = await process.StandardOutput.ReadToEndAsync(cancellationToken);

        return output
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(name => name.Trim())
            .Where(name => !string.IsNullOrEmpty(name))
            .Select(name => new DiscoveredPrinterDto(name, name, 0))
            .ToList();
    }
}
