using DiscClone.Domain.Messages;
using Microsoft.EntityFrameworkCore;

namespace DiscClone.Infrastructure.Persistence.Repositories;

public sealed class MessageRepository(DiscCloneDbContext dbContext) : IMessageRepository
{
    public async Task AddAsync(Message message, CancellationToken cancellationToken = default) =>
        await dbContext.Messages.AddAsync(message, cancellationToken);

    public Task<Message?> GetByIdAsync(Guid messageId, CancellationToken cancellationToken = default) =>
        dbContext.Messages.FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);

    public void Remove(Message message) => dbContext.Messages.Remove(message);

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
