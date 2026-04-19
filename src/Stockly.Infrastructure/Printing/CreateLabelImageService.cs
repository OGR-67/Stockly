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
        int targetW = (int)Math.Round((double)Math.Min(widthMm, heightMm) * LabelDpi / 25.4);
        float padding = Math.Max(6f, targetW * 0.04f);
        float availableW = targetW - 2 * padding;

        BitMatrix? qrMatrix = null;
        int qrScale = 1;
        int qrRenderedSize = 0;

        try
        {
            var writer = new BarcodeWriter<BitMatrix> { Format = BarcodeFormat.QR_CODE };
            qrMatrix = writer.Encode(barcodeValue);
            qrScale = Math.Max(1, (int)(availableW / qrMatrix.Width));
            qrRenderedSize = qrMatrix.Width * qrScale;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate QR code for value {BarcodeValue}", barcodeValue);
        }

        var fontFamily = GetFontFamily();
        var semanticLines = BuildSemanticLines(productName, expiryDate, note);
        var physicalLines = WrapAllLines(semanticLines, fontFamily, availableW);

        float textTotalH = physicalLines.Count > 0
            ? physicalLines.Sum(l => l.scaledPx * 1.2f) + LineSpacing * (physicalLines.Count - 1)
            : 0;
        int targetH = (int)Math.Ceiling(padding + textTotalH + padding + qrRenderedSize + padding);

        logger.LogInformation("Label: {W}x{H}px, lines={Lines}, qr={Qr}px, text={Text}px",
            targetW, targetH, physicalLines.Count, qrRenderedSize, textTotalH);

        using var image = new Image<Rgba32>(targetW, targetH, Color.White);

        DrawTextRows(image, physicalLines, targetW, padding, availableW);

        if (qrMatrix is not null)
        {
            int qrOffsetX = (targetW - qrRenderedSize) / 2;
            int qrOffsetY = (int)(padding + textTotalH + padding);
            DrawQrMatrix(image, qrMatrix, qrScale, qrOffsetX, qrOffsetY);
        }

        image.Metadata.HorizontalResolution = LabelDpi;
        image.Metadata.VerticalResolution = LabelDpi;
        image.Metadata.ResolutionUnits = PixelResolutionUnit.PixelsPerInch;

        using var ms = new MemoryStream();
        image.SaveAsPng(ms, new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression });
        return ms.ToArray();
    }

    private static List<(string text, float pt)> BuildSemanticLines(string productName, DateTime? expiryDate, string note)
    {
        var lines = new List<(string text, float pt)> { (productName, NamePt) };
        if (expiryDate.HasValue) lines.Add(($"DLC: {expiryDate:dd/MM/yyyy}", DatePt));
        if (!string.IsNullOrEmpty(note)) lines.Add((note, NotePt));
        return lines;
    }

    // Word-wraps each semantic line into physical lines that fit within availableW
    private static List<(string text, float scaledPx, Font font)> WrapAllLines(
        List<(string text, float pt)> semanticLines, FontFamily fontFamily, float availableW)
    {
        var result = new List<(string, float, Font)>();
        foreach (var (text, pt) in semanticLines)
        {
            var font = fontFamily.CreateFont(pt, pt == NamePt ? FontStyle.Bold : FontStyle.Regular);
            float scaledPx = pt * PtScale;
            foreach (var wrapped in WordWrap(text, font, availableW))
                result.Add((wrapped, scaledPx, font));
        }
        return result;
    }

    private static IEnumerable<string> WordWrap(string text, Font font, float maxWidth)
    {
        var words = text.Split(' ');
        var current = new StringBuilder();

        foreach (var word in words)
        {
            var candidate = current.Length == 0 ? word : current + " " + word;
            var w = TextMeasurer.MeasureSize(candidate, new TextOptions(font) { Dpi = LabelDpi }).Width;

            if (w > maxWidth && current.Length > 0)
            {
                yield return current.ToString();
                current.Clear();
                current.Append(word);
            }
            else
            {
                if (current.Length > 0) current.Append(' ');
                current.Append(word);
            }
        }

        if (current.Length > 0) yield return current.ToString();
    }

    private static void DrawTextRows(Image<Rgba32> image, List<(string text, float scaledPx, Font font)> lines, float imgW, float padding, float availableW)
    {
        float cy = padding;
        image.Mutate(ctx =>
        {
            foreach (var (text, scaledPx, font) in lines)
            {
                var size = TextMeasurer.MeasureSize(text, new TextOptions(font) { Dpi = LabelDpi });
                float cx = padding + Math.Max(0f, (availableW - size.Width) / 2f);
                ctx.DrawText(NoAntialias, text, font, Color.Black, new PointF(cx, cy));
                cy += scaledPx * 1.2f + LineSpacing;
            }
        });
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
