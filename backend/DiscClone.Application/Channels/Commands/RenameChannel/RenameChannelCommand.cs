using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Commands.RenameChannel;

public sealed record RenameChannelCommand(Guid ServerId, Guid ChannelId, string Name, Guid RequestingUserId)
    : IRequest<Result>;
