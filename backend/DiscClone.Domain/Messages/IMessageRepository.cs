namespace DiscClone.Domain.Messages;

public interface IMessageRepository
{
    Task AddAsync(Message message, CancellationToken cancellationToken = default);
    Task<Message?> GetByIdAsync(Guid messageId, CancellationToken cancellationToken = default);
    void Remove(Message message);

    /// <summary>Retorna as últimas <paramref name="limit"/> mensagens do canal, em ordem cronológica.</summary>
    Task<IReadOnlyList<Message>> GetByChannelAsync(
        Guid channelId, int limit, CancellationToken cancellationToken = default);
}
