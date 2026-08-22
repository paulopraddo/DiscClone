using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Servers;

public sealed class Server : Entity
{
    private readonly List<Channel> _channels = [];
    private readonly List<ServerMember> _members = [];

    public ServerName Name { get; private set; }
    public Guid OwnerId { get; }
    public DateTime CreatedAt { get; }
    public IReadOnlyCollection<Channel> Channels => _channels.AsReadOnly();
    public IReadOnlyCollection<ServerMember> Members => _members.AsReadOnly();

    private Server(Guid id, ServerName name, Guid ownerId, DateTime createdAt)
        : base(id)
    {
        Name = name;
        OwnerId = ownerId;
        CreatedAt = createdAt;
    }

    public static Result<Server> Create(ServerName name, Guid ownerId)
    {
        var server = new Server(Guid.NewGuid(), name, ownerId, DateTime.UtcNow);
        server._members.Add(ServerMember.Create(server.Id, ownerId));

        return Result.Ok(server);
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

    public Result<ServerMember> AddMember(Guid userId)
    {
        if (_members.Any(m => m.UserId == userId))
        {
            return Result.Fail("Você já é membro deste servidor.");
        }

        var member = ServerMember.Create(Id, userId);
        _members.Add(member);

        return Result.Ok(member);
    }

    public void Rename(ServerName name)
    {
        Name = name;
    }
}
