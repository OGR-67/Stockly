using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.Printers;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/printers")]
public class PrintersController(IPrinterService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await service.GetAllAsync());

    [HttpGet("{id:guid}/formats")]
    public async Task<IActionResult> GetFormats(Guid id) =>
        Ok(await service.GetFormatsAsync(id));

    [HttpPost("{id:guid}/print")]
    public async Task<IActionResult> Print(Guid id, [FromBody] PrintRequest request)
    {
        await service.PrintAsync(id, request);
        return NoContent();
    }
}
