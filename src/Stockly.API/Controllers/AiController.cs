using Microsoft.AspNetCore.Mvc;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController(IAIServiceResolver aiServiceResolver, IStorageLocationService locationService) : ControllerBase
{
    [HttpPost("parse-receipt")]
    public async Task<IActionResult> ParseReceipt(IFormFile? image, CancellationToken cancellationToken)
    {
        if (image is null || image.Length == 0)
            return BadRequest("Une image de ticket de caisse est requise.");

        var aiService = await aiServiceResolver.ResolveAsync(cancellationToken);

        await using var stream = image.OpenReadStream();
        var items = await aiService.ParseReceiptAsync(stream, image.ContentType, cancellationToken);

        return Ok(items);
    }

    [HttpPost("recognize-shelf")]
    public async Task<IActionResult> RecognizeShelf(IFormFile? image, Guid locationId, CancellationToken cancellationToken)
    {
        if (image is null || image.Length == 0)
            return BadRequest("Une image de l'emplacement est requise.");

        // Lève NotFoundException (-> 404) si l'emplacement n'existe pas, plutôt que de laisser
        // l'IA tourner sur un locationId invalide.
        await locationService.GetByIdAsync(locationId);

        var aiService = await aiServiceResolver.ResolveAsync(cancellationToken);

        await using var stream = image.OpenReadStream();
        var items = await aiService.RecognizeShelfAsync(stream, image.ContentType, locationId, cancellationToken);

        return Ok(items);
    }

    [HttpPost("test-connection")]
    public async Task<IActionResult> TestConnection(CancellationToken cancellationToken)
    {
        var aiService = await aiServiceResolver.ResolveAsync(cancellationToken);
        var result = await aiService.TestConnectionAsync(cancellationToken);
        return Ok(result);
    }
}
