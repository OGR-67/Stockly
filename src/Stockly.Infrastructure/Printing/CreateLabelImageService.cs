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
using System.Text;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Printing;

public class CreateLabelImageService(ILogger<CreateLabelImageService> logger) : ICreateLabelImageService
{
    private const int LabelDpi = 180;
    private const float PtScale = LabelDpi / 72f;
    private static readonly Rgba32 Black = new(0, 0, 0);
    private static readonly DrawingOptions NoAntialias = new() { GraphicsOptions = { Antialias = false } };

    private const float NamePt = 18f;
    private const float DatePt = 12f;
    private const float NotePt = 10f;
    private const float LineSpacing = 3f;

    public byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm)
    {
        const float TapeWidthMm = 24f;
        float tapeWidthPx = TapeWidthMm * LabelDpi / 25.4f;
        float marginPx = 3f * LabelDpi / 25.4f;
        float qrSizePx = tapeWidthPx;
        float gapPx = 2f * LabelDpi / 25.4f;

        BitMatrix? qrMatrix = null;
        int qrScale = 1;

        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.QR_CODE };
            qrMatrix = writer.Encode(barcodeValue);
            qrScale = Math.Max(1, (int)(qrSizePx / qrMatrix.Width));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate QR code for value {BarcodeValue}", barcodeValue);
        }

        var fontFamily = GetFontFamily();
        var textLines = BuildTextLines(productName, expiryDate, note);
        var measuredLines = MeasureTextLines(textLines, fontFamily);

        float textWidthPx = measuredLines.Count > 0 ? measuredLines.Max(l => l.width) : 0;
        float totalWidthPx = marginPx + qrSizePx + gapPx + textWidthPx + marginPx;

        int imgWidth = (int)Math.Ceiling(totalWidthPx);
        int imgHeight = (int)Math.Round(tapeWidthPx);

        logger.LogInformation("Label: {W}x{H}px, qr={Qr}px, text={Text}px, lines={Lines}",
            imgWidth, imgHeight, (int)qrSizePx, (int)textWidthPx, measuredLines.Count);

        using var image = new Image<Rgba32>(imgWidth, imgHeight, Color.White);

        if (qrMatrix is not null)
        {
            int qrX = (int)marginPx;
            int qrY = (int)((imgHeight - qrSizePx) / 2);
            DrawQrMatrix(image, qrMatrix, qrScale, qrX, qrY);
        }

        float textX = marginPx + qrSizePx + gapPx;
        float textY = marginPx;
        image.Mutate(ctx =>
        {
            foreach (var (text, font, scaledPx, _) in measuredLines)
            {
                ctx.DrawText(NoAntialias, text, font, Color.Black, new PointF(textX, textY));
                textY += scaledPx + 2f;
            }
        });

        int darkPixels = 0;
        for (int y = 0; y < image.Height; y++)
            for (int x = 0; x < image.Width; x++)
                if (image[x, y].R < 200) darkPixels++;
        logger.LogInformation("Dark pixels: {Count} / {Total}", darkPixels, image.Width * image.Height);

        image.Metadata.HorizontalResolution = LabelDpi;
        image.Metadata.VerticalResolution = LabelDpi;
        image.Metadata.ResolutionUnits = PixelResolutionUnit.PixelsPerInch;

        using var ms = new MemoryStream();
        image.SaveAsPng(ms, new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression });
        return ms.ToArray();
    }

    private static List<(string text, float pt)> BuildTextLines(string productName, DateTime? expiryDate, string note)
    {
        var lines = new List<(string text, float pt)> { (productName, NamePt) };
        if (expiryDate.HasValue) lines.Add(($"DLC: {expiryDate:dd/MM/yyyy}", DatePt));
        if (!string.IsNullOrEmpty(note)) lines.Add((note, NotePt));
        return lines;
    }

    private static List<(string text, Font font, float scaledPx, float width)> MeasureTextLines(
        List<(string text, float pt)> lines, FontFamily fontFamily)
    {
        var result = new List<(string, Font, float, float)>();
        foreach (var (text, pt) in lines)
        {
            var font = fontFamily.CreateFont(pt, pt == NamePt ? FontStyle.Bold : FontStyle.Regular);
            var size = TextMeasurer.MeasureSize(text, new TextOptions(font) { Dpi = LabelDpi });
            float scaledPx = pt * PtScale;
            result.Add((text, font, scaledPx, size.Width));
        }
        return result;
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
