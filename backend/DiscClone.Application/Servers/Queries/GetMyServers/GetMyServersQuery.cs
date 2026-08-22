using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Queries.GetMyServers;

public sealed record GetMyServersQuery(Guid UserId) : IRequest<Result<IReadOnlyList<ServerSummary>>>;
