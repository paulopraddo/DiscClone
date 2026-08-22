namespace DiscClone.Domain.Servers;

public interface IServerMemberRepository
{
    Task<bool> ExistsAsync(Guid serverId, Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(ServerMember member, CancellationToken cancellationToken = default);
}
