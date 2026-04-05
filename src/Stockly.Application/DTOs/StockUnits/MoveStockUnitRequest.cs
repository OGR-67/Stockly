using System.ComponentModel.DataAnnotations;

namespace Stockly.Application.DTOs.StockUnits;

public record MoveStockUnitRequest([Required] Guid LocationId);
