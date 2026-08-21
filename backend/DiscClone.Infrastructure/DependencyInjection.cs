using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using DiscClone.Domain.Users;
using DiscClone.Infrastructure.Persistence;
using DiscClone.Infrastructure.Persistence.Repositories;
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

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IServerRepository, ServerRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
