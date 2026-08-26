using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.DeleteServer;

public sealed class DeleteServerCommandHandler(
    IServerRepository serverRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteServerCommand, Result>
{
    public async Task<Result> Handle(DeleteServerCommand request, CancellationToken cancellationToken)
    {
        var server = await serverRepository.GetByIdAsync(request.ServerId, cancellationToken);

        if (server is null)
        {
            return Result.Fail("Servidor não encontrado.");
        }

        if (server.OwnerId != request.RequestingUserId)
        {
            return Result.Fail("Apenas o dono do servidor pode deletá-lo.");
        }

        serverRepository.Remove(server);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
