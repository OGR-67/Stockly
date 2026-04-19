using SkiaSharp;
using ZXing;
using ZXing.Common;
using Microsoft.Extensions.Logging;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class CreateLabelImageService(ILogger<CreateLabelImageService> logger) : ICreateLabelImageService
{
    private const int LabelDpi = 180;

    public byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm)
    {
        int targetW = (int)Math.Round((double)widthMm * LabelDpi / 25.4);
        int targetH = (int)Math.Round((double)heightMm * LabelDpi / 25.4);

        using var surface = SKSurface.Create(new SKImageInfo(targetW, targetH));
        var canvas = surface.Canvas;
        canvas.Clear(SKColors.White);

        float padding = Math.Max(4, targetW * 0.05f);
        float contentWidth = targetW - padding * 2;
        float currentY = padding;

        // Product name (bold, top)
        currentY = DrawText(canvas, productName, padding, currentY, contentWidth, 11, bold: true, padding);

        // Expiry date
        if (expiryDate.HasValue)
        {
            var dateText = $"DLC: {expiryDate:dd/MM/yyyy}";
            currentY = DrawText(canvas, dateText, padding, currentY, contentWidth, 8, bold: false, padding * 0.5f);
        }

        // Barcode (centered, large)
        currentY += padding;
        float barcodeHeight = targetH * 0.45f;
        DrawBarcode(canvas, barcodeValue, padding, currentY, contentWidth, barcodeHeight, logger);
        currentY += barcodeHeight;

        // Note (bottom)
        if (!string.IsNullOrEmpty(note))
        {
            currentY += padding * 0.5f;
            DrawText(canvas, note, padding, currentY, contentWidth, 7, bold: false, padding * 0.5f);
        }

        using var image = surface.Snapshot();
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        return data.ToArray();
    }

    private static float DrawText(SKCanvas canvas, string text, float x, float y, float maxWidth, int fontSize, bool bold, float lineHeight)
    {
        using var typeface = SKTypeface.FromFamilyName("Arial", bold ? SKFontStyle.Bold : SKFontStyle.Normal);
        using var font = new SKFont(typeface, fontSize);
        using var paint = new SKPaint { Color = SKColors.Black, IsAntialias = true };

        var lines = WrapText(text, font, maxWidth);
        float currentY = y;

        foreach (var line in lines)
        {
            canvas.DrawText(line, x, currentY + fontSize, SKTextAlign.Left, font, paint);
            currentY += lineHeight;
        }

        return currentY;
    }

    private static List<string> WrapText(string text, SKFont font, float maxWidth)
    {
        var words = text.Split(' ');
        var lines = new List<string>();
        var currentLine = "";

        foreach (var word in words)
        {
            var testLine = string.IsNullOrEmpty(currentLine) ? word : currentLine + " " + word;
            var width = font.MeasureText(testLine);

            if (width <= maxWidth)
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

        return lines.Count > 0 ? lines : new List<string> { text };
    }

    private static void DrawBarcode(SKCanvas canvas, string barcodeValue, float x, float y, float width, float height, ILogger logger)
    {
        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.CODE_128 };
            var bitMatrix = writer.Encode(barcodeValue);

            float scaleX = width / bitMatrix.Width;
            float scaleY = height / bitMatrix.Height;
            int scale = Math.Max(1, (int)Math.Min(scaleX, scaleY) * 95 / 100);

            int barcodeW = bitMatrix.Width * scale;
            int barcodeH = bitMatrix.Height * scale;
            int offsetX = (int)(x + (width - barcodeW) / 2);
            int offsetY = (int)y;

            using var paint = new SKPaint { Color = SKColors.Black };

            for (int by = 0; by < bitMatrix.Height; by++)
            {
                for (int bx = 0; bx < bitMatrix.Width; bx++)
                {
                    if (bitMatrix[bx, by])
                    {
                        int px = offsetX + bx * scale;
                        int py = offsetY + by * scale;

                        var rect = new SKRect(px, py, px + scale, py + scale);
                        canvas.DrawRect(rect, paint);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate barcode for value {BarcodeValue}", barcodeValue);
        }
    }
}
