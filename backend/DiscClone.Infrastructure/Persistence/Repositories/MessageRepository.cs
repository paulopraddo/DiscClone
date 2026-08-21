using DiscClone.Domain.Messages;

namespace DiscClone.Infrastructure.Persistence.Repositories;

public sealed class MessageRepository(DiscCloneDbContext dbContext) : IMessageRepository
{
    public async Task AddAsync(Message message, CancellationToken cancellationToken = default) =>
        await dbContext.Messages.AddAsync(message, cancellationToken);
}
