namespace DiscClone.Domain.Messages;

public interface IMessageRepository
{
    Task AddAsync(Message message, CancellationToken cancellationToken = default);
}
