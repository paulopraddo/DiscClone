using DiscClone.Domain.Messages;
using Microsoft.EntityFrameworkCore;

namespace DiscClone.Infrastructure.Persistence.Repositories;

public sealed class MessageRepository(DiscCloneDbContext dbContext) : IMessageRepository
{
    public async Task AddAsync(Message message, CancellationToken cancellationToken = default) =>
        await dbContext.Messages.AddAsync(message, cancellationToken);

    public async Task<IReadOnlyList<Message>> GetByChannelAsync(
        Guid channelId, int limit, CancellationToken cancellationToken = default)
    {
        var messages = await dbContext.Messages
            .Where(m => m.ChannelId == channelId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        messages.Reverse();
        return messages;
    }
}
