using DiscClone.Application.Messages.Commands.SendMessage;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace DiscClone.Infrastructure.Realtime;

public sealed class ChatHub(ISender sender) : Hub
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

    public static string GetGroupName(Guid channelId) => $"channel:{channelId}";
}
