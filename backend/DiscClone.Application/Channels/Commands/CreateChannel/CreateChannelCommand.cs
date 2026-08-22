using DiscClone.Domain.Channels;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Commands.CreateChannel;

public sealed record CreateChannelCommand(Guid ServerId, string Name, ChannelType Type, Guid RequestingUserId)
    : IRequest<Result<Guid>>;
