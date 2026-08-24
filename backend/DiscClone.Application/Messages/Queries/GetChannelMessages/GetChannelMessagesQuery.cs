using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Queries.GetChannelMessages;

public sealed record GetChannelMessagesQuery(Guid ChannelId, Guid UserId) : IRequest<Result<IReadOnlyList<MessageSummary>>>;
