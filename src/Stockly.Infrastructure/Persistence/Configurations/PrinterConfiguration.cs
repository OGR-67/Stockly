using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stockly.Core.Entities;

namespace Stockly.Infrastructure.Persistence.Configurations;

public class PrinterConfiguration : IEntityTypeConfiguration<Printer>
{
    public void Configure(EntityTypeBuilder<Printer> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.IpAddress).IsRequired().HasMaxLength(45);
        builder.Property(p => p.Port).HasDefaultValue(631);

        builder.HasMany(p => p.Formats)
            .WithOne(f => f.Printer)
            .HasForeignKey(f => f.PrinterId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
