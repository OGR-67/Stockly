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
        // Landscape: long dimension = label length (width), short = tape width (height)
        int targetW = (int)Math.Round((double)Math.Max(widthMm, heightMm) * LabelDpi / 25.4);
        int targetH = (int)Math.Round((double)Math.Min(widthMm, heightMm) * LabelDpi / 25.4);

        float padding = Math.Max(6f, targetH * 0.04f);
        float spacing = Math.Max(3f, targetH * 0.025f);
        float contentW = targetW - padding * 2;

        // Compute text block height to determine remaining space for barcode
        float textH = NamePt * PtScale * 1.2f;
        if (expiryDate.HasValue) textH += spacing + DatePt * PtScale * 1.2f;
        if (!string.IsNullOrEmpty(note)) textH += spacing + NotePt * PtScale * 1.2f;

        float barcodeAvailableH = Math.Max(20f, targetH - padding * 2 - textH - spacing);

        // Pre-generate barcode to compute x scale (bar widths must be integer multiples)
        BitMatrix? bitMatrix = null;
        int xScale = 1;
        int barcodeRenderedW = 0;

        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.CODE_128 };
            bitMatrix = writer.Encode(barcodeValue);
            xScale = Math.Max(1, (int)(contentW / bitMatrix.Width));
            barcodeRenderedW = bitMatrix.Width * xScale;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate barcode for value {BarcodeValue}", barcodeValue);
        }

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

            if (!string.IsNullOrEmpty(note))
            {
                cy = DrawTextCentered(ctx, note, cy, targetW, NotePt, bold: false, fontFamily);
                cy += spacing;
            }

            barcodeY = cy;
        });

        if (bitMatrix is not null)
        {
            int barcodeOffsetX = (int)(padding + (contentW - barcodeRenderedW) / 2);
            // X scale is integer (preserves bar widths), Y is stretched to fill available height
            DrawBarcodeMatrix(image, bitMatrix, xScale, barcodeAvailableH, barcodeOffsetX, (int)barcodeY);
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
        float scaledPx = fontSize * PtScale;
        var font = fontFamily.CreateFont(scaledPx, bold ? FontStyle.Bold : FontStyle.Regular);
        var size = TextMeasurer.MeasureSize(text, new TextOptions(font));
        float x = Math.Max(4f, (canvasWidth - size.Width) / 2f);

        ctx.DrawText(NoAntialias, text, font, Color.Black, new PointF(x, y));
        return y + scaledPx * 1.2f;
    }

    private static void DrawBarcodeMatrix(Image<Rgba32> image, BitMatrix bitMatrix, int xScale, float availableH, int offsetX, int offsetY)
    {
        // Bar widths use integer xScale to stay crisp; height is stretched to fill available space
        float yScale = availableH / bitMatrix.Height;

        for (int by = 0; by < bitMatrix.Height; by++)
        {
            for (int bx = 0; bx < bitMatrix.Width; bx++)
            {
                if (!bitMatrix[bx, by]) continue;

                int px = offsetX + bx * xScale;
                int py = offsetY + (int)(by * yScale);
                int cellH = Math.Max(1, (int)((by + 1) * yScale) - (int)(by * yScale));

                for (int dy = 0; dy < cellH && py + dy < image.Height; dy++)
                    for (int dx = 0; dx < xScale && px + dx < image.Width; dx++)
                        image[px + dx, py + dy] = Black;
            }
        }
    }
}
