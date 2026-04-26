using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Png;
using Stockly.Infrastructure.Printing;

// Usage: dotnet run -- "Product Name" [YYYY-MM-DD] [note] [barcode]
string productName = args.ElementAtOrDefault(0) ?? "Jambon Blanc";
DateTime? expiryDate = args.ElementAtOrDefault(1) is { } d ? DateTime.Parse(d) : DateTime.Today.AddDays(3);
string note = args.ElementAtOrDefault(2) ?? "note: test";
string barcode = args.ElementAtOrDefault(3) ?? "ABC-123456";

var svc = new CreateLabelImageService(NullLogger<CreateLabelImageService>.Instance);

byte[] labelPng = svc.GenerateLabel(productName, expiryDate, note, barcode, 60, 24);
await File.WriteAllBytesAsync("label_landscape.png", labelPng);
Console.WriteLine("Saved label_landscape.png");

// Simulate SendToCups: rotate 90° CW + tape margins
const int TapeMarginPx = 35; // ~5mm at 180 DPI
byte[] printBytes;

using (var img = Image.Load(labelPng))
{
    img.Mutate(x => x.Rotate(RotateMode.Rotate90));
    using var padded = new Image<Rgba32>(img.Width, img.Height + 2 * TapeMarginPx, Color.White);
    padded.Mutate(ctx => ctx.DrawImage(img, new Point(0, TapeMarginPx), 1f));
    using var rotMs = new MemoryStream();
    padded.SaveAsPng(rotMs, new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression });
    printBytes = rotMs.ToArray();
}

await File.WriteAllBytesAsync("label_print.png", printBytes);
var imgInfo = Image.Identify(new MemoryStream(printBytes));
Console.WriteLine($"Saved label_print.png  ({imgInfo.Width}×{imgInfo.Height}px — portrait, sent to driver)");
