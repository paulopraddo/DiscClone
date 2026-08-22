using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Queries.CanAccessChannel;

public sealed record CanAccessChannelQuery(Guid ChannelId, Guid UserId) : IRequest<Result<bool>>;
