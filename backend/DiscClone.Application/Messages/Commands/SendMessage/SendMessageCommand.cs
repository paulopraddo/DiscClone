using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Commands.SendMessage;

public sealed record SendMessageCommand(Guid ChannelId, Guid AuthorId, string Content) : IRequest<Result<Guid>>;
