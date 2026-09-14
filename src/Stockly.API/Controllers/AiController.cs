using Microsoft.AspNetCore.Mvc;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController(IAIServiceResolver aiServiceResolver) : ControllerBase
{
    [HttpPost("parse-receipt")]
    public async Task<IActionResult> ParseReceipt(IFormFile? image, CancellationToken cancellationToken)
    {
        if (image is null || image.Length == 0)
            return BadRequest("Une image de ticket de caisse est requise.");

        var aiService = await aiServiceResolver.ResolveAsync(cancellationToken);

        await using var stream = image.OpenReadStream();
        var items = await aiService.ParseReceiptAsync(stream, cancellationToken);

        return Ok(items);
    }
}
