using Microsoft.EntityFrameworkCore;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence.Configurations;

namespace Stockly.Infrastructure.Persistence;

public class StocklyDbContext(DbContextOptions<StocklyDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<StorageLocation> StorageLocations => Set<StorageLocation>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Barcode> Barcodes => Set<Barcode>();
    public DbSet<StockUnit> StockUnits => Set<StockUnit>();
    public DbSet<Printer> Printers => Set<Printer>();
    public DbSet<PrinterFormat> PrinterFormats => Set<PrinterFormat>();
    public DbSet<Recipe> Recipes => Set<Recipe>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        modelBuilder.ApplyConfiguration(new StorageLocationConfiguration());
        modelBuilder.ApplyConfiguration(new ProductConfiguration());
        modelBuilder.ApplyConfiguration(new BarcodeConfiguration());
        modelBuilder.ApplyConfiguration(new StockUnitConfiguration());
        modelBuilder.ApplyConfiguration(new PrinterConfiguration());
        modelBuilder.ApplyConfiguration(new PrinterFormatConfiguration());
        modelBuilder.ApplyConfiguration(new RecipeConfiguration());
    }
}
