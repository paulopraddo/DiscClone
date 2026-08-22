using DiscClone.Domain.Common;

namespace DiscClone.Domain.Servers;

public sealed class ServerMember : Entity
{
    public Guid ServerId { get; }
    public Guid UserId { get; }
    public DateTime JoinedAt { get; }

    private ServerMember(Guid id, Guid serverId, Guid userId, DateTime joinedAt)
        : base(id)
    {
        ServerId = serverId;
        UserId = userId;
        JoinedAt = joinedAt;
    }

    public static ServerMember Create(Guid serverId, Guid userId) =>
        new(Guid.NewGuid(), serverId, userId, DateTime.UtcNow);
}
