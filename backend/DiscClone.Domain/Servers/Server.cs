using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Servers;

public sealed class Server : Entity
{
    private readonly List<Channel> _channels = [];

    public ServerName Name { get; private set; }
    public Guid OwnerId { get; }
    public DateTime CreatedAt { get; }
    public IReadOnlyCollection<Channel> Channels => _channels.AsReadOnly();

    private Server(Guid id, ServerName name, Guid ownerId, DateTime createdAt)
        : base(id)
    {
        Name = name;
        OwnerId = ownerId;
        CreatedAt = createdAt;
    }

    public static Result<Server> Create(ServerName name, Guid ownerId)
    {
        return Result.Ok(new Server(Guid.NewGuid(), name, ownerId, DateTime.UtcNow));
    }

    public Result<Channel> AddChannel(ChannelName name, ChannelType type)
    {
        var channelResult = Channel.Create(Id, name, type);

        if (channelResult.IsFailed)
        {
            return channelResult;
        }

        _channels.Add(channelResult.Value);
        return channelResult;
    }

    public void Rename(ServerName name)
    {
        Name = name;
    }
}
