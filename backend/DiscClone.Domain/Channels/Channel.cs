using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Channels;

public sealed class Channel : Entity
{
    public Guid ServerId { get; }
    public ChannelName Name { get; private set; }
    public ChannelType Type { get; }
    public DateTime CreatedAt { get; }

    private Channel(Guid id, Guid serverId, ChannelName name, ChannelType type, DateTime createdAt)
        : base(id)
    {
        ServerId = serverId;
        Name = name;
        Type = type;
        CreatedAt = createdAt;
    }

    public static Result<Channel> Create(Guid serverId, ChannelName name, ChannelType type)
    {
        return Result.Ok(new Channel(Guid.NewGuid(), serverId, name, type, DateTime.UtcNow));
    }

    public void Rename(ChannelName name)
    {
        Name = name;
    }
}
