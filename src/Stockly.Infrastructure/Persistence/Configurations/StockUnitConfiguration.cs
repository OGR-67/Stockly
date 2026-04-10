using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stockly.Core.Entities;

namespace Stockly.Infrastructure.Persistence.Configurations;

public class StockUnitConfiguration : IEntityTypeConfiguration<StockUnit>
{
    public void Configure(EntityTypeBuilder<StockUnit> builder)
    {
        builder.HasKey(s => s.Id);

        builder.HasOne(s => s.Product)
            .WithMany()
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Location)
            .WithMany()
            .HasForeignKey(s => s.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(s => s.FreeText).HasMaxLength(2000);
    }
}
