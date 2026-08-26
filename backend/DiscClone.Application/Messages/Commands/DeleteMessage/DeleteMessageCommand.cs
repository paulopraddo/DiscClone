using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Commands.DeleteMessage;

public sealed record DeleteMessageCommand(Guid MessageId, Guid RequestingUserId) : IRequest<Result<Guid>>;
