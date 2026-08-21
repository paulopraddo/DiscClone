using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.CreateServer;

public sealed record CreateServerCommand(string Name, Guid OwnerId) : IRequest<Result<Guid>>;
