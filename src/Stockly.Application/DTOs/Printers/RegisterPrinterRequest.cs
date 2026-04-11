using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Printers;

public record RegisterPrinterRequest(
    [Required, MinLength(1)] string Name,
    [Required, MinLength(1)] string QueueName,
    int Port = 631,
    bool IsDefault = false
);
