using Microsoft.EntityFrameworkCore;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Core.Entities;
using Stockly.Infrastructure.Persistence;

namespace Stockly.Infrastructure.Repositories;

public class SettingsRepository(StocklyDbContext context) : ISettingsRepository
{
    public async Task<Settings> GetAsync()
    {
        var settings = await context.Settings.FirstOrDefaultAsync();
        if (settings is not null)
            return settings;

        settings = new Settings { Id = Guid.NewGuid() };
        context.Settings.Add(settings);
        await context.SaveChangesAsync();
        return settings;
    }

    public async Task<Settings> UpdateAsync(Settings settings)
    {
        context.Settings.Update(settings);
        await context.SaveChangesAsync();
        return settings;
    }
}
