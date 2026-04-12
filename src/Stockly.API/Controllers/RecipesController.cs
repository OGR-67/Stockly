using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.Recipes;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/recipes")]
public class RecipesController(IRecipeService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveRecipeRequest request)
    {
        var created = await service.CreateAsync(request);
        return Ok(created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveRecipeRequest request)
    {
        var updated = await service.UpdateAsync(id, request);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
