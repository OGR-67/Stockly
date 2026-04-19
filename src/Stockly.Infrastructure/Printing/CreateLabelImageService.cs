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
    private static readonly Rgba32 Black = new(0, 0, 0);
    private static readonly DrawingOptions NoAntialias = new() { GraphicsOptions = { Antialias = false } };

    public byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm)
    {
        // widthMm = label length (feeds through printer), heightMm = tape width (print head width)
        int targetW = (int)Math.Round((double)widthMm * LabelDpi / 25.4);
        int targetH = (int)Math.Round((double)heightMm * LabelDpi / 25.4);

        using var image = new Image<Rgba32>(targetW, targetH, Color.White);

        float padding = Math.Max(4, targetH * 0.05f);
        float availableH = targetH - padding * 2;
        float spacing = Math.Max(2, targetH * 0.025f);
        var fontFamily = GetFontFamily();

        const float namePt = 12f;
        const float datePt = 9f;
        const float notePt = 7f;

        float nameH = namePt * 1.25f;
        float dateH = expiryDate.HasValue ? datePt * 1.25f : 0;
        float noteH = !string.IsNullOrEmpty(note) ? notePt * 1.25f : 0;

        float textH = nameH
            + (dateH > 0 ? spacing + dateH : 0)
            + (noteH > 0 ? spacing + noteH : 0);

        float barcodeH = Math.Max(30, availableH - textH - spacing);

        float barcodeY = 0;

        image.Mutate(ctx =>
        {
            float cy = padding;

            cy = DrawTextCentered(ctx, productName, cy, targetW, namePt, bold: true, fontFamily);
            cy += spacing;

            if (expiryDate.HasValue)
            {
                cy = DrawTextCentered(ctx, $"DLC: {expiryDate:dd/MM/yyyy}", cy, targetW, datePt, bold: false, fontFamily);
                cy += spacing;
            }

            barcodeY = cy;

            if (!string.IsNullOrEmpty(note))
            {
                float noteY = cy + barcodeH + spacing;
                _ = DrawTextCentered(ctx, note, noteY, targetW, notePt, bold: false, fontFamily);
            }
        });

        DrawBarcode(image, barcodeValue, padding, barcodeY, targetW - padding * 2, barcodeH);

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
        var font = fontFamily.CreateFont(fontSize, bold ? FontStyle.Bold : FontStyle.Regular);
        var size = TextMeasurer.MeasureSize(text, new TextOptions(font));
        float x = Math.Max(4, (canvasWidth - size.Width) / 2);

        ctx.DrawText(NoAntialias, text, font, Color.Black, new PointF(x, y));
        return y + fontSize * 1.25f;
    }

    private void DrawBarcode(Image<Rgba32> image, string barcodeValue, float x, float y, float width, float height)
    {
        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.CODE_128 };
            var bitMatrix = writer.Encode(barcodeValue);

            float scaleX = width / bitMatrix.Width;
            float scaleY = height / bitMatrix.Height;
            int scale = Math.Max(1, (int)Math.Min(scaleX, scaleY));

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
