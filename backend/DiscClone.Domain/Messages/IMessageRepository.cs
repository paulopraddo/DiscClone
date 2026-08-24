namespace DiscClone.Domain.Messages;

public interface IMessageRepository
{
    Task AddAsync(Message message, CancellationToken cancellationToken = default);

    /// <summary>Retorna as últimas <paramref name="limit"/> mensagens do canal, em ordem cronológica.</summary>
    Task<IReadOnlyList<Message>> GetByChannelAsync(
        Guid channelId, int limit, CancellationToken cancellationToken = default);
}
