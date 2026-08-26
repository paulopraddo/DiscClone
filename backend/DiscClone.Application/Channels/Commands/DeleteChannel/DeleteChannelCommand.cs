using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Commands.DeleteChannel;

public sealed record DeleteChannelCommand(Guid ServerId, Guid ChannelId, Guid RequestingUserId) : IRequest<Result>;
