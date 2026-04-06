using Microsoft.AspNetCore.Mvc;
using Stockly.Application.DTOs.Products;
using Stockly.Application.Interfaces.Services;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await service.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) => Ok(await service.GetByIdAsync(id));

    [HttpGet("barcode/{barcode}")]
    public async Task<IActionResult> GetByBarcode(string barcode) => Ok(await service.GetByBarcodeAsync(barcode));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveProductRequest request)
    {
        var created = await service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveProductRequest request) =>
        Ok(await service.UpdateAsync(id, request));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/barcodes")]
    public async Task<IActionResult> AddBarcode(Guid id, [FromBody] AddBarcodeRequest request)
    {
        await service.AddBarcodeAsync(id, request.Barcode);
        return NoContent();
    }

    [HttpDelete("barcodes/{barcode}")]
    public async Task<IActionResult> DeleteBarcode(string barcode)
    {
        await service.DeleteBarcodeAsync(barcode);
        return NoContent();
    }
}
