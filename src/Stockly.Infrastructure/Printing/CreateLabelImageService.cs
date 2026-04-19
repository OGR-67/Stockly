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
    private const float PtScale = LabelDpi / 72f; // points → pixels at 180 DPI
    private static readonly Rgba32 Black = new(0, 0, 0);
    private static readonly DrawingOptions NoAntialias = new() { GraphicsOptions = { Antialias = false } };

    private const float NamePt = 14f;
    private const float DatePt = 10f;
    private const float NotePt = 8f;

    public byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm)
    {
        // Always use the narrow dimension as tape width regardless of storage order
        int targetW = (int)Math.Round((double)Math.Min(widthMm, heightMm) * LabelDpi / 25.4);

        float padding = Math.Max(6f, targetW * 0.04f);
        float spacing = Math.Max(3f, targetW * 0.02f);
        float contentWidth = targetW - padding * 2;

        // Pre-generate barcode matrix to compute exact rendered size
        BitMatrix? bitMatrix = null;
        int barcodeScale = 1;
        int barcodeRenderedW = 0;
        int barcodeRenderedH = 0;

        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.CODE_128 };
            bitMatrix = writer.Encode(barcodeValue);
            barcodeScale = Math.Max(1, (int)(contentWidth / bitMatrix.Width));
            barcodeRenderedW = bitMatrix.Width * barcodeScale;
            barcodeRenderedH = bitMatrix.Height * barcodeScale;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate barcode for value {BarcodeValue}", barcodeValue);
        }

        // Compute exact content height (fonts scaled to 180 DPI)
        float nameLineH = NamePt * PtScale * 1.2f;
        float dateLineH = expiryDate.HasValue ? DatePt * PtScale * 1.2f : 0f;
        float noteLineH = !string.IsNullOrEmpty(note) ? NotePt * PtScale * 1.2f : 0f;

        float textH = nameLineH
            + (dateLineH > 0 ? spacing + dateLineH : 0f);

        float totalContentH = textH
            + (barcodeRenderedH > 0 ? spacing + barcodeRenderedH : 0f)
            + (noteLineH > 0 ? spacing + noteLineH : 0f);

        int targetH = (int)Math.Ceiling(padding + totalContentH + padding);

        using var image = new Image<Rgba32>(targetW, targetH, Color.White);
        var fontFamily = GetFontFamily();

        float barcodeY = 0;

        image.Mutate(ctx =>
        {
            float cy = padding;

            cy = DrawTextCentered(ctx, productName, cy, targetW, NamePt, bold: true, fontFamily);
            cy += spacing;

            if (expiryDate.HasValue)
            {
                cy = DrawTextCentered(ctx, $"DLC: {expiryDate:dd/MM/yyyy}", cy, targetW, DatePt, bold: false, fontFamily);
                cy += spacing;
            }

            barcodeY = cy;

            if (!string.IsNullOrEmpty(note))
            {
                float noteY = cy + barcodeRenderedH + spacing;
                _ = DrawTextCentered(ctx, note, noteY, targetW, NotePt, bold: false, fontFamily);
            }
        });

        if (bitMatrix is not null)
        {
            int barcodeOffsetX = (int)(padding + (contentWidth - barcodeRenderedW) / 2);
            DrawBarcodeMatrix(image, bitMatrix, barcodeScale, barcodeOffsetX, (int)barcodeY);
        }

        image.Metadata.HorizontalResolution = LabelDpi;
        image.Metadata.VerticalResolution = LabelDpi;
        image.Metadata.ResolutionUnits = PixelResolutionUnit.PixelsPerInch;

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

    private static float DrawTextCentered(IImageProcessingContext ctx, string text, float y, float canvasWidth, float fontSize, bool bold, FontFamily fontFamily)
    {
        // Scale pt→px at LabelDpi so physical size matches typographic point size
        float scaledPx = fontSize * PtScale;
        var font = fontFamily.CreateFont(scaledPx, bold ? FontStyle.Bold : FontStyle.Regular);
        var size = TextMeasurer.MeasureSize(text, new TextOptions(font));
        float x = Math.Max(4f, (canvasWidth - size.Width) / 2f);

        ctx.DrawText(NoAntialias, text, font, Color.Black, new PointF(x, y));
        return y + scaledPx * 1.2f;
    }

    private static void DrawBarcodeMatrix(Image<Rgba32> image, BitMatrix bitMatrix, int scale, int offsetX, int offsetY)
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
