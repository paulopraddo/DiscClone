using DiscClone.Domain.Channels;
using DiscClone.Domain.Messages;
using DiscClone.Domain.Servers;
using DiscClone.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace DiscClone.Infrastructure.Persistence;

public sealed class DiscCloneDbContext(DbContextOptions<DiscCloneDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Server> Servers => Set<Server>();
    public DbSet<Channel> Channels => Set<Channel>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DiscCloneDbContext).Assembly);
    }
}
