using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Printers;

public record RegisterPrinterRequest(
    [Required, MinLength(1)] string Name,
    [Required, MinLength(1)] string IpAddress,
    int Port = 631,
    bool IsDefault = false
);
