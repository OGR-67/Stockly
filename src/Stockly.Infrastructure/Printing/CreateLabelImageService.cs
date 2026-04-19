using ZXing;
using ZXing.Common;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.Fonts;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class CreateLabelImageService(ILogger<CreateLabelImageService> logger) : ICreateLabelImageService
{
    private const int LabelDpi = 180;
    private static readonly Rgba32 Black = new(0, 0, 0);

    public byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm)
    {
        int targetW = (int)Math.Round((double)widthMm * LabelDpi / 25.4);
        int targetH = (int)Math.Round((double)heightMm * LabelDpi / 25.4);

        using var image = new Image<Rgba32>(targetW, targetH, Color.White);

        float padding = Math.Max(4, targetW * 0.05f);
        float contentWidth = targetW - padding * 2;
        float barcodeHeight = targetH * 0.45f;
        var fontFamily = GetFontFamily();

        float barcodeY = 0;

        image.Mutate(ctx =>
        {
            float cy = padding;

            cy = DrawText(ctx, productName, padding, cy, contentWidth, 11, bold: true, fontFamily);
            cy += padding * 0.3f;

            if (expiryDate.HasValue)
            {
                cy = DrawText(ctx, $"DLC: {expiryDate:dd/MM/yyyy}", padding, cy, contentWidth, 8, bold: false, fontFamily);
                cy += padding * 0.3f;
            }

            barcodeY = cy + padding;

            if (!string.IsNullOrEmpty(note))
            {
                float noteY = barcodeY + barcodeHeight + padding * 0.5f;
                _ = DrawText(ctx, note, padding, noteY, contentWidth, 7, bold: false, fontFamily);
            }
        });

        DrawBarcode(image, barcodeValue, padding, barcodeY, contentWidth, barcodeHeight);

        using var ms = new MemoryStream();
        image.SaveAsPng(ms, new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression });
        return ms.ToArray();
    }

    private static FontFamily GetFontFamily()
    {
        string[] candidates = ["DejaVu Sans", "Liberation Sans", "Arial", "FreeSans", "Helvetica"];
        var available = SystemFonts.Families.Select(f => f.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var match = candidates.FirstOrDefault(available.Contains);
        return match is not null ? SystemFonts.Get(match) : SystemFonts.Families.First();
    }

    private static float DrawText(IImageProcessingContext ctx, string text, float x, float y, float maxWidth, float fontSize, bool bold, FontFamily fontFamily)
    {
        var font = fontFamily.CreateFont(fontSize, bold ? FontStyle.Bold : FontStyle.Regular);
        var lines = WrapText(text, font, maxWidth);
        float lineHeight = fontSize * 1.2f;
        float currentY = y;

        foreach (var line in lines)
        {
            ctx.DrawText(line, font, Color.Black, new PointF(x, currentY));
            currentY += lineHeight;
        }

        return currentY;
    }

    private static List<string> WrapText(string text, Font font, float maxWidth)
    {
        var words = text.Split(' ');
        var lines = new List<string>();
        var currentLine = "";

        foreach (var word in words)
        {
            var testLine = string.IsNullOrEmpty(currentLine) ? word : currentLine + " " + word;
            var size = TextMeasurer.MeasureSize(testLine, new TextOptions(font));

            if (size.Width <= maxWidth)
            {
                currentLine = testLine;
            }
            else
            {
                if (!string.IsNullOrEmpty(currentLine))
                    lines.Add(currentLine);
                currentLine = word;
            }
        }

        if (!string.IsNullOrEmpty(currentLine))
            lines.Add(currentLine);

        return lines.Count > 0 ? lines : [text];
    }

    private void DrawBarcode(Image<Rgba32> image, string barcodeValue, float x, float y, float width, float height)
    {
        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.CODE_128 };
            var bitMatrix = writer.Encode(barcodeValue);

            float scaleX = width / bitMatrix.Width;
            float scaleY = height / bitMatrix.Height;
            int scale = Math.Max(1, (int)(Math.Min(scaleX, scaleY) * 95 / 100));

            int barcodeW = bitMatrix.Width * scale;
            int offsetX = (int)(x + (width - barcodeW) / 2);
            int offsetY = (int)y;

            for (int by = 0; by < bitMatrix.Height; by++)
            {
                for (int bx = 0; bx < bitMatrix.Width; bx++)
                {
                    if (!bitMatrix[bx, by]) continue;

                    int px = offsetX + bx * scale;
                    int py = offsetY + by * scale;

                    for (int dy = 0; dy < scale && py + dy < image.Height; dy++)
                        for (int dx = 0; dx < scale && px + dx < image.Width; dx++)
                            image[px + dx, py + dy] = Black;
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate barcode for value {BarcodeValue}", barcodeValue);
        }
    }
}
