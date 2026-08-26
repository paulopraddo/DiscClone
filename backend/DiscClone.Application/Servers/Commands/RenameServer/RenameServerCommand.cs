using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.RenameServer;

public sealed record RenameServerCommand(Guid ServerId, string Name, Guid RequestingUserId) : IRequest<Result>;
