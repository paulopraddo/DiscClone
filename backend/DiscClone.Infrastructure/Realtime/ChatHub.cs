using System.Security.Claims;
using DiscClone.Application.Messages.Commands.SendMessage;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DiscClone.Infrastructure.Realtime;

public sealed record VoiceChannelState(IReadOnlyCollection<VoiceParticipant> Participants);

[Authorize]
public sealed class ChatHub(ISender sender, VoiceRoomRegistry voiceRooms) : Hub
{
    public Task JoinChannel(Guid channelId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(channelId));

    public Task LeaveChannel(Guid channelId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(channelId));

    public async Task SendMessage(Guid channelId, string content)
    {
        var authorId = GetUserId();
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

    public Task StartVoiceScreenShare(Guid channelId, string peerId) =>
        Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("ScreenShareStarted", new
        {
            AuthorId = GetUserId(),
            PeerId = peerId
        });

    public Task StopVoiceScreenShare(Guid channelId) =>
        Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("ScreenShareStopped", new
        {
            AuthorId = GetUserId()
        });

    public async Task<VoiceChannelState> JoinVoiceChannel(Guid channelId, string peerId)
    {
        var username = GetUsername();
        var existingPeers = voiceRooms.Join(channelId, peerId, username, Context.ConnectionId);

        await Groups.AddToGroupAsync(Context.ConnectionId, GetVoiceGroupName(channelId));
        await Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("VoiceParticipantJoined", new
        {
            PeerId = peerId,
            Username = username
        });

        return new VoiceChannelState(existingPeers);
    }

    public async Task LeaveVoiceChannel(Guid channelId)
    {
        var info = voiceRooms.Leave(Context.ConnectionId);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetVoiceGroupName(channelId));

        if (info is not null)
        {
            await BroadcastParticipantLeft(channelId, info.Value.PeerId);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var info = voiceRooms.Leave(Context.ConnectionId);

        if (info is not null)
        {
            await BroadcastParticipantLeft(info.Value.ChannelId, info.Value.PeerId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private Task BroadcastParticipantLeft(Guid channelId, string peerId)
    {
        var voiceGroup = GetVoiceGroupName(channelId);
        var authorId = GetUserId();

        return Task.WhenAll(
            Clients.OthersInGroup(voiceGroup).SendAsync("VoiceParticipantLeft", new { PeerId = peerId }),
            Clients.OthersInGroup(voiceGroup).SendAsync("ScreenShareStopped", new { AuthorId = authorId }));
    }

    private Guid GetUserId() =>
        Guid.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string GetUsername() =>
        Context.User!.FindFirstValue(ClaimTypes.Name)!;

    public static string GetGroupName(Guid channelId) => $"channel:{channelId}";

    public static string GetVoiceGroupName(Guid channelId) => $"voice:{channelId}";
}
