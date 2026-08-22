using System.Security.Claims;
using DiscClone.Application.Messages.Commands.SendMessage;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DiscClone.Infrastructure.Realtime;

public sealed record VoiceChannelState(IReadOnlyCollection<VoiceParticipant> Participants, ActiveScreenShare? ScreenShare);

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

    public Task StartScreenShare(Guid channelId, string peerId) =>
        Clients.OthersInGroup(GetGroupName(channelId)).SendAsync("ScreenShareStarted", new
        {
            AuthorId = GetUserId(),
            PeerId = peerId
        });

    public Task StopScreenShare(Guid channelId) =>
        Clients.OthersInGroup(GetGroupName(channelId)).SendAsync("ScreenShareStopped", new
        {
            AuthorId = GetUserId()
        });

    public Task StartVoiceScreenShare(Guid channelId, string peerId)
    {
        var authorId = GetUserId();
        voiceRooms.SetScreenShare(channelId, authorId, peerId);

        return Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("ScreenShareStarted", new
        {
            AuthorId = authorId,
            PeerId = peerId
        });
    }

    public Task StopVoiceScreenShare(Guid channelId)
    {
        var authorId = GetUserId();
        voiceRooms.ClearScreenShare(channelId, authorId);

        return Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("ScreenShareStopped", new
        {
            AuthorId = authorId
        });
    }

    public async Task<VoiceChannelState> JoinVoiceChannel(Guid channelId, string peerId)
    {
        var username = GetUsername();
        var existingPeers = voiceRooms.Join(channelId, peerId, username, Context.ConnectionId);
        var activeScreenShare = voiceRooms.GetActiveScreenShare(channelId);

        await Groups.AddToGroupAsync(Context.ConnectionId, GetVoiceGroupName(channelId));
        await Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("VoiceParticipantJoined", new
        {
            PeerId = peerId,
            Username = username
        });

        return new VoiceChannelState(existingPeers, activeScreenShare);
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

            if (info.Value.ScreenShareStopped)
            {
                await Clients.OthersInGroup(GetVoiceGroupName(channelId)).SendAsync("ScreenShareStopped", new
                {
                    AuthorId = GetUserId()
                });
            }
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var info = voiceRooms.Leave(Context.ConnectionId);

        if (info is not null)
        {
            var voiceGroup = GetVoiceGroupName(info.Value.ChannelId);

            await Clients.OthersInGroup(voiceGroup).SendAsync("VoiceParticipantLeft", new
            {
                PeerId = info.Value.PeerId
            });

            if (info.Value.ScreenShareStopped)
            {
                await Clients.OthersInGroup(voiceGroup).SendAsync("ScreenShareStopped", new
                {
                    AuthorId = GetUserId()
                });
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    private Guid GetUserId() =>
        Guid.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private string GetUsername() =>
        Context.User!.FindFirstValue(ClaimTypes.Name)!;

    public static string GetGroupName(Guid channelId) => $"channel:{channelId}";

    public static string GetVoiceGroupName(Guid channelId) => $"voice:{channelId}";
}
