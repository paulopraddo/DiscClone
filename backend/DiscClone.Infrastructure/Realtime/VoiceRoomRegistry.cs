using System.Collections.Concurrent;

namespace DiscClone.Infrastructure.Realtime;

public sealed record VoiceParticipant(string PeerId, string Username);

public sealed class VoiceRoomRegistry
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, string>> _rooms = new();
    private readonly ConcurrentDictionary<string, (Guid ChannelId, string PeerId, string Username)> _connections = new();

    public IReadOnlyCollection<VoiceParticipant> Join(Guid channelId, string peerId, string username, string connectionId)
    {
        var room = _rooms.GetOrAdd(channelId, _ => new ConcurrentDictionary<string, string>());
        var existingPeers = room.Select(kvp => new VoiceParticipant(kvp.Key, kvp.Value)).ToArray();

        room[peerId] = username;
        _connections[connectionId] = (channelId, peerId, username);

        return existingPeers;
    }

    /// <summary>Lê os participantes atuais de uma sala sem entrar nela.</summary>
    public IReadOnlyCollection<VoiceParticipant> Peek(Guid channelId) =>
        _rooms.TryGetValue(channelId, out var room)
            ? room.Select(kvp => new VoiceParticipant(kvp.Key, kvp.Value)).ToArray()
            : Array.Empty<VoiceParticipant>();

    /// <summary>
    /// Indica se a conexão está de fato participando do canal (não apenas observando) — usado
    /// para não remover do grupo SignalR quem está numa call de verdade ao parar de observar.
    /// </summary>
    public bool IsParticipant(string connectionId, Guid channelId) =>
        _connections.TryGetValue(connectionId, out var info) && info.ChannelId == channelId;

    public (Guid ChannelId, string PeerId, string Username)? Leave(string connectionId)
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
