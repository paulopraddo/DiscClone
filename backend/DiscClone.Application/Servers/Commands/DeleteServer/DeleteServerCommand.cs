using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.DeleteServer;

public sealed record DeleteServerCommand(Guid ServerId, Guid RequestingUserId) : IRequest<Result>;
