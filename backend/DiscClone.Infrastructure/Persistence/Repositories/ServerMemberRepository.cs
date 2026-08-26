using DiscClone.Domain.Servers;
using Microsoft.EntityFrameworkCore;

namespace DiscClone.Infrastructure.Persistence.Repositories;

public sealed class ServerMemberRepository(DiscCloneDbContext dbContext) : IServerMemberRepository
{
    public Task<bool> ExistsAsync(Guid serverId, Guid userId, CancellationToken cancellationToken = default) =>
        dbContext.Set<ServerMember>().AnyAsync(m => m.ServerId == serverId && m.UserId == userId, cancellationToken);

    public Task<ServerMember?> GetAsync(Guid serverId, Guid userId, CancellationToken cancellationToken = default) =>
        dbContext.Set<ServerMember>().FirstOrDefaultAsync(m => m.ServerId == serverId && m.UserId == userId, cancellationToken);

    public async Task AddAsync(ServerMember member, CancellationToken cancellationToken = default) =>
        await dbContext.Set<ServerMember>().AddAsync(member, cancellationToken);

    public void Remove(ServerMember member) => dbContext.Set<ServerMember>().Remove(member);
}
