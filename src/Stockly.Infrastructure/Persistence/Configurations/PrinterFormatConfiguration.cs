using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stockly.Core.Entities;

namespace Stockly.Infrastructure.Persistence.Configurations;

public class PrinterFormatConfiguration : IEntityTypeConfiguration<PrinterFormat>
{
    public void Configure(EntityTypeBuilder<PrinterFormat> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(100);
        builder.Property(f => f.WidthMm).HasPrecision(6, 2);
        builder.Property(f => f.HeightMm).HasPrecision(6, 2);
    }
}
