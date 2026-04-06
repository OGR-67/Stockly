using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Printers;

public record PrintRequest(
    [Required] Guid FormatId,
    [Required, MinLength(1)] string ImageBase64
);
