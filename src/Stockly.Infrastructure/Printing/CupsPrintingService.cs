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

public class CupsPrintingService(IPrinterRepository printerRepository, ICreateLabelImageService labelImageService, ILogger<CupsPrintingService> logger) : IPrintingService
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

        await SendToCups(printer.QueueName, resizedBytes);
    }

    public async Task PrintLabelAsync(Guid printerId, PrintLabelRequest request)
    {
        logger.LogInformation("Starting label print job for printer {PrinterId}", printerId);

        var printer = await printerRepository.GetByIdAsync(printerId)
            ?? throw new NotFoundException($"Printer {printerId} not found.");

        var format = printer.Formats.FirstOrDefault(f => f.Id == request.FormatId)
            ?? throw new NotFoundException($"Format {request.FormatId} not found.");

        logger.LogDebug("Found printer {PrinterName} with queue {QueueName}", printer.Name, printer.QueueName);

        var imageBytes = labelImageService.GenerateLabel(
            request.ProductName,
            request.ExpiryDate,
            request.Note,
            request.BarcodeValue,
            format.WidthMm,
            format.HeightMm
        );
        logger.LogDebug("Label image generated: {ByteLength} bytes", imageBytes.Length);

        await SendToCups(printer.QueueName, imageBytes);
    }

    private async Task SendToCups(string queueName, byte[] imageBytes)
    {
        // Brother driver expects portrait orientation (width=tape width).
        // Rotate landscape label 90° CW so the driver sees 24mm wide × Nmm tall portrait.
        byte[] printBytes;
        using (var img = Image.Load(imageBytes))
        {
            img.Mutate(x => x.Rotate(RotateMode.Rotate90));
            using var rotMs = new MemoryStream();
            img.SaveAsPng(rotMs, new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression });
            printBytes = rotMs.ToArray();
        }

        var tmpFile = Path.GetTempFileName() + ".png";
        await File.WriteAllBytesAsync(tmpFile, printBytes);
        await File.WriteAllBytesAsync("/tmp/label_debug.png", printBytes);

        var imgInfo = Image.Identify(new MemoryStream(printBytes));
        double wPts = imgInfo.Width * 72.0 / PrintDpi;
        double hPts = imgInfo.Height * 72.0 / PrintDpi;
        var mediaArg = FormattableString.Invariant($"Custom.{wPts:F0}x{hPts:F0}");
        logger.LogInformation("lp args: -d {Queue} -o PageSize={Media} {File} (image {W}x{H}px after rotate)",
            queueName, mediaArg, tmpFile, imgInfo.Width, imgInfo.Height);

        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = "lp",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            };
            psi.ArgumentList.Add("-d"); psi.ArgumentList.Add(queueName);
            psi.ArgumentList.Add("-o"); psi.ArgumentList.Add($"PageSize={mediaArg}");
            psi.ArgumentList.Add("-o"); psi.ArgumentList.Add("fit-to-page=false");
            psi.ArgumentList.Add(tmpFile);

            var process = Process.Start(psi) ?? throw new InvalidOperationException("Failed to start lp process.");

            await process.WaitForExitAsync();

            var stdout = await process.StandardOutput.ReadToEndAsync();
            var stderr = await process.StandardError.ReadToEndAsync();
            if (!string.IsNullOrWhiteSpace(stdout)) logger.LogInformation("lp stdout: {Stdout}", stdout.Trim());
            if (!string.IsNullOrWhiteSpace(stderr)) logger.LogWarning("lp stderr: {Stderr}", stderr.Trim());

            if (process.ExitCode != 0)
            {
                logger.LogError("Print job failed with exit code {ExitCode}", process.ExitCode);
                throw new InvalidOperationException($"Print job failed: {stderr}");
            }

            logger.LogInformation("Print job sent successfully to {QueueName}", queueName);
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
