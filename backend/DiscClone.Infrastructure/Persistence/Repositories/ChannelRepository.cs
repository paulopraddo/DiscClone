using DiscClone.Domain.Channels;
using Microsoft.EntityFrameworkCore;

namespace DiscClone.Infrastructure.Persistence.Repositories;

public sealed class ChannelRepository(DiscCloneDbContext dbContext) : IChannelRepository
{
    public Task<bool> ExistsAsync(Guid channelId, CancellationToken cancellationToken = default) =>
        dbContext.Channels.AnyAsync(c => c.Id == channelId, cancellationToken);

    public async Task AddAsync(Channel channel, CancellationToken cancellationToken = default) =>
        await dbContext.Channels.AddAsync(channel, cancellationToken);
}
