using System.Collections.Concurrent;

namespace DiscClone.Infrastructure.Realtime;

public sealed class VoiceRoomRegistry
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, byte>> _rooms = new();
    private readonly ConcurrentDictionary<string, (Guid ChannelId, string PeerId)> _connections = new();

    public IReadOnlyCollection<string> Join(Guid channelId, string peerId, string connectionId)
    {
        var room = _rooms.GetOrAdd(channelId, _ => new ConcurrentDictionary<string, byte>());
        var existingPeers = room.Keys.ToArray();

        room[peerId] = 0;
        _connections[connectionId] = (channelId, peerId);

        return existingPeers;
    }

    public (Guid ChannelId, string PeerId)? Leave(string connectionId)
    {
        if (!_connections.TryRemove(connectionId, out var info))
        {
            return null;
        }

        if (_rooms.TryGetValue(info.ChannelId, out var room))
        {
            room.TryRemove(info.PeerId, out _);
        }

        return info;
    }
}
