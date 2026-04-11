using System.Diagnostics;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Png;
using Stockly.Application.DTOs.Printers;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class CupsPrintingService(IPrinterRepository printerRepository) : IPrintingService
{
    private const double PrintDpi = 300;

    public async Task PrintAsync(Guid printerId, Guid formatId, PrintRequest job)
    {
        var printer = await printerRepository.GetByIdAsync(printerId)
            ?? throw new NotFoundException($"Printer {printerId} not found.");

        var format = printer.Formats.FirstOrDefault(f => f.Id == formatId)
            ?? throw new NotFoundException($"Format {formatId} not found.");

        var imageBytes = Convert.FromBase64String(job.ImageBase64);
        var resizedBytes = ResizeToFormat(imageBytes, (int)format.WidthMm, (int)format.HeightMm);

        var tmpFile = Path.GetTempFileName() + ".png";
        await File.WriteAllBytesAsync(tmpFile, resizedBytes);

        try
        {
            var process = Process.Start(new ProcessStartInfo
            {
                FileName = "lp",
                Arguments = $"-d \"{printer.QueueName}\" \"{tmpFile}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            }) ?? throw new InvalidOperationException("Failed to start lp process.");

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                var error = await process.StandardError.ReadToEndAsync();
                throw new InvalidOperationException($"Print job failed: {error}");
            }
        }
        finally
        {
            if (File.Exists(tmpFile))
                File.Delete(tmpFile);
        }
    }

    private static byte[] ResizeToFormat(byte[] imageBytes, int widthMm, int heightMm)
    {
        int targetW = (int)Math.Round(widthMm * PrintDpi / 25.4);
        int targetH = (int)Math.Round(heightMm * PrintDpi / 25.4);

        using var image = Image.Load(imageBytes);
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Size = new Size(targetW, targetH),
            Mode = ResizeMode.Pad,
            PadColor = Color.White,
        }));

        using var ms = new MemoryStream();
        image.SaveAsPng(ms, new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression });
        return ms.ToArray();
    }
}
