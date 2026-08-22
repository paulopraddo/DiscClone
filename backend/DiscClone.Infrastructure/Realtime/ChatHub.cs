using DiscClone.Application.Messages.Commands.SendMessage;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace DiscClone.Infrastructure.Realtime;

public sealed class ChatHub(ISender sender, VoiceRoomRegistry voiceRooms) : Hub
{
    public Task JoinChannel(Guid channelId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(channelId));

    public Task LeaveChannel(Guid channelId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(channelId));

    public async Task SendMessage(Guid channelId, Guid authorId, string content)
    {
        var result = await sender.Send(new SendMessageCommand(channelId, authorId, content));

        if (result.IsFailed)
        {
            await Clients.Caller.SendAsync("MessageRejected", result.Errors.Select(e => e.Message));
            return;
        }

        await Clients.Group(GetGroupName(channelId)).SendAsync("ReceiveMessage", new
        {
            MessageId = result.Value,
            ChannelId = channelId,
            AuthorId = authorId,
            Content = content,
            SentAt = DateTime.UtcNow
        });
    }

    public Task StartScreenShare(Guid channelId, Guid authorId, string peerId) =>
        Clients.OthersInGroup(GetGroupName(channelId)).SendAsync("ScreenShareStarted", new
        {
            AuthorId = authorId,
            PeerId = peerId
        });

    public Task StopScreenShare(Guid channelId, Guid authorId) =>
        Clients.OthersInGroup(GetGroupName(channelId)).SendAsync("ScreenShareStopped", new
        {
            AuthorId = authorId
        });

    public async Task<IReadOnlyCollection<string>> JoinVoiceChannel(Guid channelId, string peerId)
    {
        var existingPeers = voiceRooms.Join(channelId, peerId, Context.ConnectionId);

        await Groups.AddToGroupAsync(Context.ConnectionId, GetVoiceGroupName(channelId));
        await Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("VoiceParticipantJoined", new
        {
            PeerId = peerId
        });

        return existingPeers;
    }

    public async Task LeaveVoiceChannel(Guid channelId)
    {
        var info = voiceRooms.Leave(Context.ConnectionId);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetVoiceGroupName(channelId));

        if (info is not null)
        {
            await Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("VoiceParticipantLeft", new
            {
                PeerId = info.Value.PeerId
            });
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var info = voiceRooms.Leave(Context.ConnectionId);

        if (info is not null)
        {
            await Clients.OthersInGroup(GetVoiceGroupName(info.Value.ChannelId)).SendAsync("VoiceParticipantLeft", new
            {
                PeerId = info.Value.PeerId
            });
        }

        await base.OnDisconnectedAsync(exception);
    }

    public static string GetGroupName(Guid channelId) => $"channel:{channelId}";

    public static string GetVoiceGroupName(Guid channelId) => $"voice:{channelId}";
}
