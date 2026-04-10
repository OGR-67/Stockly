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

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStockUnitRequest request) =>
        Ok(await service.UpdateAsync(id, request));

    [HttpPut("{id:guid}/open")]
    public async Task<IActionResult> Open(Guid id) => Ok(await service.OpenAsync(id));

    [HttpPut("{id:guid}/move")]
    public async Task<IActionResult> Move(Guid id, [FromBody] MoveStockUnitRequest request) =>
        Ok(await service.MoveAsync(id, request));

    [HttpPut("{id:guid}/consume")]
    public async Task<IActionResult> Consume(Guid id) => Ok(await service.ConsumeAsync(id));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
