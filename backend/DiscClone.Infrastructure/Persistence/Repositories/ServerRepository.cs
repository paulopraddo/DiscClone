using DiscClone.Domain.Servers;
using Microsoft.EntityFrameworkCore;

namespace DiscClone.Infrastructure.Persistence.Repositories;

public sealed class ServerRepository(DiscCloneDbContext dbContext) : IServerRepository
{
    public Task<Server?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Servers
            .Include(s => s.Channels)
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<IReadOnlyCollection<Server>> GetByMemberUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        await dbContext.Servers
            .Include(s => s.Channels)
            .Where(s => s.Members.Any(m => m.UserId == userId))
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Server server, CancellationToken cancellationToken = default) =>
        await dbContext.Servers.AddAsync(server, cancellationToken);
}
