using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.Printers;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/printers")]
public class PrintersController(IPrinterService service, IPrinterDiscoveryService discovery) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await service.GetAllAsync());

    [HttpGet("{id:guid}/formats")]
    public async Task<IActionResult> GetFormats(Guid id) =>
        Ok(await service.GetFormatsAsync(id));

    [HttpGet("discover")]
    public async Task<IActionResult> Discover(CancellationToken cancellationToken)
    {
        var found = await discovery.DiscoverAsync(cancellationToken);
        return Ok(found);
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterPrinterRequest request)
    {
        var created = await service.RegisterAsync(request);
        return Ok(created);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/print")]
    public async Task<IActionResult> Print(Guid id, [FromBody] PrintRequest request)
    {
        await service.PrintAsync(id, request);
        return NoContent();
    }
}
