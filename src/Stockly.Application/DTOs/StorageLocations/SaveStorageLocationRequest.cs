using System.ComponentModel.DataAnnotations;
using Stockly.Core.Entities;

namespace Stockly.Application.DTOs.StorageLocations;

public record SaveStorageLocationRequest(
    [Required, MinLength(1)] string Name,
    LocationType Type
);
