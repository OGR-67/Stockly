using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Stockly.Core.Entities;

namespace Stockly.Infrastructure.Persistence;

/// <summary>
/// Seed de données réalistes pour le développement local. Ne s'exécute que si la base est vide
/// (pas de duplication au redémarrage normal) et ne doit être appelé qu'en environnement
/// Development — jamais en Production.
/// </summary>
public static class DevSeeder
{
    private static readonly Dictionary<string, List<string>> ProductsByCategory = new()
    {
        ["Produits laitiers"] = ["Lait demi-écrémé", "Yaourt nature", "Camembert", "Beurre doux", "Crème fraîche", "Emmental râpé", "Œufs"],
        ["Viande"] = ["Poulet fermier", "Steak haché", "Jambon blanc", "Saucisses de Toulouse", "Escalope de dinde"],
        ["Fruits"] = ["Pommes", "Bananes", "Oranges", "Fraises", "Kiwis"],
        ["Légumes"] = ["Carottes", "Tomates", "Courgettes", "Pommes de terre", "Salade", "Aubergines"],
        ["Épicerie"] = ["Pâtes", "Riz", "Farine", "Sucre", "Huile d'olive", "Conserve de tomates"],
        ["Surgelés"] = ["Petits pois surgelés", "Pizza surgelée", "Glace vanille"],
        ["Boissons"] = ["Eau minérale", "Jus d'orange", "Café moulu", "Thé"],
    };

    private static readonly (string Name, bool IsPerishable, bool IsFresh, int? ClosedDays, int? OpenedDays, int? FrozenDays, int? MinStock)[] CategoryDefinitions =
    [
        ("Produits laitiers", true, true, 20, 5, 60, 2),
        ("Viande", true, true, 5, 2, 90, 1),
        ("Fruits", true, true, 7, 3, null, 3),
        ("Légumes", true, true, 10, 4, null, 3),
        ("Épicerie", false, false, 365, null, null, 2),
        ("Surgelés", true, false, null, null, 180, 2),
        ("Boissons", false, false, 180, 3, null, 4),
    ];

    private static readonly (string Name, LocationType Type)[] LocationDefinitions =
    [
        ("Frigo", LocationType.Fridge),
        ("Congélateur", LocationType.Freezer),
        ("Placard cuisine", LocationType.Normal),
        ("Cave", LocationType.Normal),
    ];

    private static readonly (string Name, string[] ProductNames)[] RecipeDefinitions =
    [
        ("Salade de fruits", ["Pommes", "Bananes", "Oranges", "Kiwis"]),
        ("Pâtes bolognaise", ["Pâtes", "Steak haché", "Tomates"]),
        ("Omelette au fromage", ["Œufs", "Emmental râpé"]),
        ("Crêpes", ["Farine", "Lait demi-écrémé", "Œufs"]),
        ("Ratatouille", ["Courgettes", "Tomates", "Aubergines"]),
    ];

    public static async Task SeedDevDataAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<StocklyDbContext>();

        if (await db.Categories.AnyAsync())
            return;

        Randomizer.Seed = new Random(20260101);
        var faker = new Faker("fr");

        var categories = CategoryDefinitions.Select(c => new Category
        {
            Id = Guid.NewGuid(),
            Name = c.Name,
            IsPerishable = c.IsPerishable,
            IsFresh = c.IsFresh,
            DefaultClosedDays = c.ClosedDays,
            DefaultOpenedDays = c.OpenedDays,
            DefaultFrozenDays = c.FrozenDays,
            MinStockUnits = c.MinStock,
        }).ToList();
        db.Categories.AddRange(categories);

        var products = new List<Product>();
        foreach (var category in categories)
        {
            foreach (var name in ProductsByCategory[category.Name])
            {
                var product = new Product
                {
                    Id = Guid.NewGuid(),
                    CategoryId = category.Id,
                    Name = name,
                    MinStockUnits = faker.Random.Bool(0.3f) ? faker.Random.Int(1, 3) : null,
                    Barcodes = [],
                };
                product.Barcodes.Add(new Barcode { Code = faker.Commerce.Ean13(), ProductId = product.Id });
                products.Add(product);
            }
        }
        db.Products.AddRange(products);

        var locations = LocationDefinitions.Select(l => new StorageLocation
        {
            Id = Guid.NewGuid(),
            Name = l.Name,
            Type = l.Type,
        }).ToList();
        db.StorageLocations.AddRange(locations);

        var fridge = locations.First(l => l.Type == LocationType.Fridge);
        var freezer = locations.First(l => l.Type == LocationType.Freezer);
        var cupboard = locations.First(l => l.Name == "Placard cuisine");

        var stockUnits = new List<StockUnit>();
        foreach (var product in faker.PickRandom(products, Math.Min(15, products.Count)))
        {
            var location = product.CategoryId == categories.First(c => c.Name == "Surgelés").Id
                ? freezer
                : faker.PickRandom(fridge, cupboard);

            var expirationDate = faker.PickRandom(
                DateTime.UtcNow.AddDays(-faker.Random.Int(1, 5)),   // expiré
                DateTime.UtcNow.AddDays(faker.Random.Int(0, 2)),    // bientôt périmé
                DateTime.UtcNow.AddDays(faker.Random.Int(10, 60))   // sain
            );

            stockUnits.Add(new StockUnit
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                LocationId = location.Id,
                ExpirationDate = expirationDate,
                IsOpened = faker.Random.Bool(0.3f),
                CreatedAt = DateTime.UtcNow.AddDays(-faker.Random.Int(0, 10)),
                FreeText = faker.Random.Bool(0.2f) ? faker.Lorem.Sentence(4) : null,
            });
        }
        db.StockUnits.AddRange(stockUnits);

        var recipes = new List<Recipe>();
        foreach (var (name, productNames) in RecipeDefinitions)
        {
            var recipeProducts = products.Where(p => productNames.Contains(p.Name)).ToList();
            if (recipeProducts.Count == 0) continue;

            recipes.Add(new Recipe
            {
                Id = Guid.NewGuid(),
                Name = name,
                Type = RecipeType.Main,
                Products = recipeProducts,
            });
        }
        db.Recipes.AddRange(recipes);

        await db.SaveChangesAsync();
    }
}
