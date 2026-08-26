namespace DiscClone.Domain.Channels;

public interface IChannelRepository
{
    Task<bool> ExistsAsync(Guid channelId, CancellationToken cancellationToken = default);
    Task<Channel?> GetByIdAsync(Guid channelId, CancellationToken cancellationToken = default);
    Task AddAsync(Channel channel, CancellationToken cancellationToken = default);
    void Remove(Channel channel);
}
