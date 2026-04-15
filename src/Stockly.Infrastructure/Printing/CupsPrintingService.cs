using System.Diagnostics;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Png;
using Stockly.Application.DTOs.Printers;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class CupsPrintingService(IPrinterRepository printerRepository, ILogger<CupsPrintingService> logger) : IPrintingService
{
    private const double PrintDpi = 180;

    public async Task PrintAsync(Guid printerId, Guid formatId, PrintRequest job)
    {
        logger.LogInformation("Starting print job for printer {PrinterId} with format {FormatId}", printerId, formatId);

        var printer = await printerRepository.GetByIdAsync(printerId)
            ?? throw new NotFoundException($"Printer {printerId} not found.");

        var format = printer.Formats.FirstOrDefault(f => f.Id == formatId)
            ?? throw new NotFoundException($"Format {formatId} not found.");

        logger.LogDebug("Found printer {PrinterName} with queue {QueueName}", printer.Name, printer.QueueName);

        var imageBytes = Convert.FromBase64String(job.ImageBase64);
        logger.LogDebug("Image decoded: {ByteLength} bytes", imageBytes.Length);

        var resizedBytes = ResizeToFormat(imageBytes, (int)format.WidthMm, (int)format.HeightMm);
        logger.LogDebug("Image resized: {ByteLength} bytes", resizedBytes.Length);

        var tmpFile = Path.GetTempFileName() + ".png";
        await File.WriteAllBytesAsync(tmpFile, resizedBytes);
        logger.LogDebug("Temporary file written to {TmpFile}", tmpFile);

        try
        {
            logger.LogInformation("Sending print job to CUPS queue {QueueName} with file {TmpFile}", printer.QueueName, tmpFile);

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
                logger.LogError("Print job failed with exit code {ExitCode}: {Error}", process.ExitCode, error);
                throw new InvalidOperationException($"Print job failed: {error}");
            }

            logger.LogInformation("Print job sent successfully to {QueueName}", printer.QueueName);
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
