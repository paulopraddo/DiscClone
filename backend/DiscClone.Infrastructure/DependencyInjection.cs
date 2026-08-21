using DiscClone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DiscClone.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DiscClone")
            ?? throw new InvalidOperationException("A connection string 'DiscClone' não foi configurada.");

        services.AddDbContext<DiscCloneDbContext>(options => options.UseNpgsql(connectionString));

        return services;
    }
}
