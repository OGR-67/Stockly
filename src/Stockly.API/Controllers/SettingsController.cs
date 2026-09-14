using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.Settings;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController(ISettingsService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await service.GetAsync());

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SaveSettingsRequest request) =>
        Ok(await service.UpdateAsync(request));
}
