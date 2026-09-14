using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stockly.Core.Entities;

namespace Stockly.Infrastructure.Persistence.Configurations;

public class SettingsConfiguration : IEntityTypeConfiguration<Settings>
{
    public void Configure(EntityTypeBuilder<Settings> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.AiProvider).HasConversion<string>().IsRequired();
        builder.Property(s => s.AiApiKey).HasMaxLength(500);
    }
}
