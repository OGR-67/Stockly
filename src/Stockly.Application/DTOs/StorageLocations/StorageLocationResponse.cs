using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.StorageLocations;

public record StorageLocationResponse(
    Guid Id,
    string Name,
    LocationType Type
);
