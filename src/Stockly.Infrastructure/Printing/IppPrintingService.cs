using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using SharpIpp;
using SharpIpp.Models;
using SharpIpp.Protocol.Models;
using Stockly.Application.DTOs.Printers;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class IppPrintingService(ISharpIppClient ippClient, IPrinterRepository printerRepository) : IPrintingService
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

        var request = new PrintJobRequest
        {
            PrinterUri = new UriBuilder("ipp", printer.QueueName, printer.Port, "ipp/print").Uri,
            Document = new MemoryStream(resizedBytes),
            DocumentAttributes = new DocumentAttributes { DocumentFormat = "image/jpeg" },
        };

        await ippClient.PrintJobAsync(request);
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
        image.SaveAsJpeg(ms, new JpegEncoder { Quality = 95 });
        return ms.ToArray();
    }
}
