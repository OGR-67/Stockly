using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.Products;

public record AddBarcodeRequest([Required, MinLength(1)] string Barcode);
