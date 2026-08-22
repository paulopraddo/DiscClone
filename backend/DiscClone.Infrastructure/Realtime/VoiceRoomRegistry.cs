using System.Collections.Concurrent;

namespace DiscClone.Infrastructure.Realtime;

public sealed record VoiceParticipant(string PeerId, string Username);

public sealed record ActiveScreenShare(Guid AuthorId, string PeerId);

public sealed class VoiceRoomRegistry
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, string>> _rooms = new();
    private readonly ConcurrentDictionary<string, (Guid ChannelId, string PeerId, string Username)> _connections = new();
    private readonly ConcurrentDictionary<Guid, ActiveScreenShare> _activeScreenShares = new();

    public IReadOnlyCollection<VoiceParticipant> Join(Guid channelId, string peerId, string username, string connectionId)
    {
        var room = _rooms.GetOrAdd(channelId, _ => new ConcurrentDictionary<string, string>());
        var existingPeers = room.Select(kvp => new VoiceParticipant(kvp.Key, kvp.Value)).ToArray();

        room[peerId] = username;
        _connections[connectionId] = (channelId, peerId, username);

        return existingPeers;
    }

    public (Guid ChannelId, string PeerId, string Username, bool ScreenShareStopped)? Leave(string connectionId)
    {
        if (!_connections.TryRemove(connectionId, out var info))
        {
            return null;
        }

        if (_rooms.TryGetValue(info.ChannelId, out var room))
        {
            room.TryRemove(info.PeerId, out _);
        }

        var screenShareStopped = _activeScreenShares.TryGetValue(info.ChannelId, out var share)
            && share.PeerId == info.PeerId
            && _activeScreenShares.TryRemove(info.ChannelId, out _);

        return (info.ChannelId, info.PeerId, info.Username, screenShareStopped);
    }

    public void SetScreenShare(Guid channelId, Guid authorId, string peerId) =>
        _activeScreenShares[channelId] = new ActiveScreenShare(authorId, peerId);

    public void ClearScreenShare(Guid channelId, Guid authorId)
    {
        if (_activeScreenShares.TryGetValue(channelId, out var share) && share.AuthorId == authorId)
        {
            _activeScreenShares.TryRemove(channelId, out _);
        }
    }

    public ActiveScreenShare? GetActiveScreenShare(Guid channelId) =>
        _activeScreenShares.TryGetValue(channelId, out var share) ? share : null;
}
