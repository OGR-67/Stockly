using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Printers;

public record PrintLabelRequest(
    [Required] Guid FormatId,
    [Required, MinLength(1)] string ProductName,
    DateTime? ExpiryDate,
    string Note,
    [Required, MinLength(1)] string BarcodeValue
);
