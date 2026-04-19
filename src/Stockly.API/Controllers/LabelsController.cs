using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.Printers;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Infrastructure.Printing;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/labels")]
public class LabelsController(IPrinterRepository printerRepository, CreateLabelImageService labelService) : ControllerBase
{
    [HttpPost("generate/{printerId:guid}")]
    public async Task<IActionResult> GenerateLabel(Guid printerId, [FromBody] PrintLabelRequest request)
    {
        var printer = await printerRepository.GetByIdAsync(printerId)
            ?? throw new NotFoundException($"Printer {printerId} not found");

        var format = printer.Formats.FirstOrDefault(f => f.Id == request.FormatId)
            ?? throw new NotFoundException($"Format {request.FormatId} not found");

        var imageBytes = labelService.GenerateLabel(
            request.ProductName,
            request.ExpiryDate,
            request.Note,
            request.BarcodeValue,
            format.WidthMm,
            format.HeightMm
        );

        return File(imageBytes, "image/png");
    }
}
