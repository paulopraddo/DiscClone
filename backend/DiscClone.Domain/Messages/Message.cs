using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Messages;

public sealed class Message : Entity
{
    public Guid ChannelId { get; }
    public Guid AuthorId { get; }
    public MessageContent Content { get; private set; }
    public DateTime CreatedAt { get; }
    public DateTime? EditedAt { get; private set; }

    private Message(Guid id, Guid channelId, Guid authorId, MessageContent content, DateTime createdAt)
        : base(id)
    {
        ChannelId = channelId;
        AuthorId = authorId;
        Content = content;
        CreatedAt = createdAt;
    }

    public static Result<Message> Create(Guid channelId, Guid authorId, MessageContent content)
    {
        return Result.Ok(new Message(Guid.NewGuid(), channelId, authorId, content, DateTime.UtcNow));
    }

    public void Edit(MessageContent content)
    {
        Content = content;
        EditedAt = DateTime.UtcNow;
    }
}
