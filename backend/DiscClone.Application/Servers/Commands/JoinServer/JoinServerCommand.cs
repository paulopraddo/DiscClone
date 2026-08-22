using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.JoinServer;

public sealed record JoinServerCommand(Guid ServerId, Guid UserId) : IRequest<Result>;
