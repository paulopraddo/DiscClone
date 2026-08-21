namespace DiscClone.Domain.Servers;

public interface IServerRepository
{
    Task<Server?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Server server, CancellationToken cancellationToken = default);
}
