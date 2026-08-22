namespace DiscClone.Domain.Servers;

public interface IServerRepository
{
    Task<Server?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Server>> GetByMemberUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(Server server, CancellationToken cancellationToken = default);
}
