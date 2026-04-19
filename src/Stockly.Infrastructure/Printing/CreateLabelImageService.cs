using ZXing;
using ZXing.Common;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata;
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
    private const float PtScale = LabelDpi / 72f;
    private static readonly Rgba32 Black = new(0, 0, 0);
    private static readonly DrawingOptions NoAntialias = new() { GraphicsOptions = { Antialias = false } };

    private const float NamePt = 14f;
    private const float DatePt = 10f;
    private const float NotePt = 8f;

    public byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm)
    {
        int targetH = (int)Math.Round((double)Math.Min(widthMm, heightMm) * LabelDpi / 25.4);

        float padding = Math.Max(6f, targetH * 0.04f);
        float qrAvailableSize = targetH - padding * 2;

        BitMatrix? qrMatrix = null;
        int qrScale = 1;
        int qrRenderedSize = 0;

        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.QR_CODE };
            qrMatrix = writer.Encode(barcodeValue);
            qrScale = Math.Max(1, (int)(qrAvailableSize / qrMatrix.Width));
            qrRenderedSize = qrMatrix.Width * qrScale;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate QR code for value {BarcodeValue}", barcodeValue);
        }

        var fontFamily = GetFontFamily();

        // Measure all text lines to size the canvas to content
        var lines = BuildLines(productName, expiryDate, note);
        float textColumnW = lines.Max(l =>
        {
            var font = fontFamily.CreateFont(l.pt * PtScale, l.pt == NamePt ? FontStyle.Bold : FontStyle.Regular);
            return TextMeasurer.MeasureSize(l.text, new TextOptions(font)).Width;
        });

        float textColumnX = padding + qrRenderedSize + padding;
        int targetW = (int)Math.Ceiling(textColumnX + textColumnW + padding);

        using var image = new Image<Rgba32>(targetW, targetH, Color.White);

        image.Mutate(ctx => DrawTextColumn(ctx, lines, textColumnX, textColumnW, targetH));

        if (qrMatrix is not null)
        {
            int qrOffsetX = (int)padding;
            int qrOffsetY = (int)(padding + (qrAvailableSize - qrRenderedSize) / 2);
            DrawQrMatrix(image, qrMatrix, qrScale, qrOffsetX, qrOffsetY);
        }

        image.Metadata.HorizontalResolution = LabelDpi;
        image.Metadata.VerticalResolution = LabelDpi;
        image.Metadata.ResolutionUnits = PixelResolutionUnit.PixelsPerInch;

        using var ms = new MemoryStream();
        image.SaveAsPng(ms, new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression });
        return ms.ToArray();
    }

    private static List<(string text, float pt)> BuildLines(string productName, DateTime? expiryDate, string note)
    {
        var lines = new List<(string text, float pt)> { (productName, NamePt) };
        if (expiryDate.HasValue) lines.Add(($"DLC: {expiryDate:dd/MM/yyyy}", DatePt));
        if (!string.IsNullOrEmpty(note)) lines.Add((note, NotePt));
        return lines;
    }

    private static void DrawTextColumn(IImageProcessingContext ctx, List<(string text, float pt)> lines, float x, float colW, float colH)
    {
        var fontFamily = GetFontFamily();
        const float lineSpacing = 4f;
        float totalH = lines.Sum(l => l.pt * PtScale * 1.2f) + lineSpacing * (lines.Count - 1);
        float cy = (colH - totalH) / 2f;

        foreach (var (text, pt) in lines)
        {
            float scaledPx = pt * PtScale;
            var font = fontFamily.CreateFont(scaledPx, pt == NamePt ? FontStyle.Bold : FontStyle.Regular);
            var size = TextMeasurer.MeasureSize(text, new TextOptions(font));
            float cx = x + Math.Max(0f, (colW - size.Width) / 2f);

            ctx.DrawText(NoAntialias, text, font, Color.Black, new PointF(cx, cy));
            cy += scaledPx * 1.2f + lineSpacing;
        }
    }

    private static FontFamily GetFontFamily()
    {
        string[] candidates = ["DejaVu Sans", "Liberation Sans", "Arial", "FreeSans", "Helvetica"];
        var available = SystemFonts.Families.Select(f => f.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var match = candidates.FirstOrDefault(available.Contains);
        return match is not null ? SystemFonts.Get(match) : SystemFonts.Families.First();
    }

    private static void DrawQrMatrix(Image<Rgba32> image, BitMatrix bitMatrix, int scale, int offsetX, int offsetY)
    {
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
}
