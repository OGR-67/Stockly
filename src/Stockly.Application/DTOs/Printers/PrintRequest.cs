using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Printers;

public record PrintRequest(
    [Required] Guid FormatId,
    [Required, MinLength(1)] string ProductName,
    DateTime? ExpirationDate,
    [Required, MinLength(1)] string Barcode,
    string? Note
);
