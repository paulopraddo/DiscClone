using Microsoft.AspNetCore.SignalR;

namespace DiscClone.Infrastructure.Realtime;

public sealed class ChatHub : Hub
{
    public Task JoinChannel(Guid channelId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(channelId));

    public Task LeaveChannel(Guid channelId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(channelId));

    public static string GetGroupName(Guid channelId) => $"channel:{channelId}";
}
