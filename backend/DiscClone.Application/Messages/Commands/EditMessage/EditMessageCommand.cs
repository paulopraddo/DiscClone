using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Commands.EditMessage;

public sealed record EditMessageCommand(Guid MessageId, string Content, Guid RequestingUserId)
    : IRequest<Result<EditMessageResult>>;

public sealed record EditMessageResult(Guid ChannelId, DateTime EditedAt);
