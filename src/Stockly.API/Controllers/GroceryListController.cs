using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.GroceryList;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/grocery-list")]
public class GroceryListController(IGroceryListService service) : ControllerBase
{
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent()
    {
        var list = await service.GetCurrentAsync();
        if (list is null) return NotFound();
        return Ok(list);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateGroceryListRequest request)
    {
        var list = await service.GenerateAsync(request);
        return Ok(list);
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        await service.RemoveItemAsync(itemId);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Clear()
    {
        await service.ClearAsync();
        return NoContent();
    }
}
