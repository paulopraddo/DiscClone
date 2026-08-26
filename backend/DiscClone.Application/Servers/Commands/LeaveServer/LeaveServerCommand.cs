using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.LeaveServer;

public sealed record LeaveServerCommand(Guid ServerId, Guid RequestingUserId) : IRequest<Result>;
