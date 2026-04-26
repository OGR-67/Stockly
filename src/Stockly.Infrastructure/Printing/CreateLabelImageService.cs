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
    private const int TapeWidthPx = 170;
    private const int MarginPx = 21;
    private const int GapPx = 14;
    private const int LabelDpi = 180;

    private const float NamePt = 25f;
    private const float DatePt = 20f;
    private const float NotePt = 20f;
    private const float LineSpacingPx = 2f;

    private static readonly Rgba32 Black = new(0, 0, 0);
    private static readonly DrawingOptions AntialiasOn = new() { GraphicsOptions = { Antialias = true } };

    public byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm)
    {
        BitMatrix? qrMatrix = null;

        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.QR_CODE };
            qrMatrix = writer.Encode(barcodeValue);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate QR code for value {BarcodeValue}", barcodeValue);
        }

        var fontFamily = GetFontFamily();
        var textLines = BuildTextLines(productName, expiryDate, note);
        var measuredLines = MeasureTextLines(textLines, fontFamily);

        int textWidthPx = measuredLines.Count > 0 ? (int)Math.Ceiling(measuredLines.Max(l => l.width)) : 0;
        int imgWidth = MarginPx + TapeWidthPx + GapPx + textWidthPx + MarginPx;
        int imgHeight = TapeWidthPx;

        int qrHeightAvailable = TapeWidthPx - 2 * MarginPx;
        float qrScale = qrMatrix is not null ? (float)qrHeightAvailable / qrMatrix.Width : 1f;

        logger.LogInformation("Label: {W}x{H}px | qr_scale={QrScale:F2} | text_width={TextWidth}px | lines={Lines}",
            imgWidth, imgHeight, qrScale, textWidthPx, measuredLines.Count);

        using var image = new Image<Rgba32>(imgWidth, imgHeight, Color.White);

        if (qrMatrix is not null)
        {
            DrawQrMatrix(image, qrMatrix, qrScale, MarginPx, 0);
        }

        int textXPx = MarginPx + TapeWidthPx + GapPx;
        float textYPx = MarginPx;
        image.Mutate(ctx =>
        {
            foreach (var (text, font, heightPx, _) in measuredLines)
            {
                ctx.DrawText(AntialiasOn, text, font, Color.Black, new PointF(textXPx, textYPx));
                textYPx += heightPx + LineSpacingPx;
            }
        });

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

    private static List<(string text, Font font, float heightPx, float width)> MeasureTextLines(
        List<(string text, float pt)> lines, FontFamily fontFamily)
    {
        var result = new List<(string, Font, float, float)>();
        foreach (var (text, pt) in lines)
        {
            var font = fontFamily.CreateFont(pt, pt == NamePt ? FontStyle.Bold : FontStyle.Regular);
            var size = TextMeasurer.MeasureSize(text, new TextOptions(font) { Dpi = LabelDpi });
            result.Add((text, font, pt, size.Width));
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

    private static void DrawQrMatrix(Image<Rgba32> image, BitMatrix bitMatrix, float scale, int offsetX, int offsetY)
    {
        for (int by = 0; by < bitMatrix.Height; by++)
        {
            for (int bx = 0; bx < bitMatrix.Width; bx++)
            {
                if (!bitMatrix[bx, by]) continue;

                int px = offsetX + (int)(bx * scale);
                int py = offsetY + (int)(by * scale);
                int nextPx = offsetX + (int)((bx + 1) * scale);
                int nextPy = offsetY + (int)((by + 1) * scale);

                for (int dy = py; dy < nextPy && dy < image.Height; dy++)
                    for (int dx = px; dx < nextPx && dx < image.Width; dx++)
                        image[dx, dy] = Black;
            }
        }
    }
}
