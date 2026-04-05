using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.StockUnits;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/stock-units")]
public class StockUnitsController(IStockUnitService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await service.GetAllAsync());

    [HttpGet("location/{locationId:guid}")]
    public async Task<IActionResult> GetByLocation(Guid locationId) =>
        Ok(await service.GetByLocationAsync(locationId));

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] CreateStockUnitRequest request)
    {
        var created = await service.AddAsync(request);
        return CreatedAtAction(null, new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}/open")]
    public async Task<IActionResult> Open(Guid id)
    {
        var result = await service.OpenAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:guid}/move")]
    public async Task<IActionResult> Move(Guid id, [FromBody] MoveStockUnitRequest request)
    {
        var result = await service.MoveAsync(id, request);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:guid}/consume")]
    public async Task<IActionResult> Consume(Guid id)
    {
        var result = await service.ConsumeAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
