namespace Stockly.Application.Interfaces.Services;

public interface ICreateLabelImageService
{
    byte[] GenerateLabel(string productName, DateTime? expiryDate, string note, string barcodeValue, decimal widthMm, decimal heightMm);
}
