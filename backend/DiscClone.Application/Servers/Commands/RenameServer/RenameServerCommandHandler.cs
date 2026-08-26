using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.RenameServer;

public sealed class RenameServerCommandHandler(
    IServerRepository serverRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<RenameServerCommand, Result>
{
    public async Task<Result> Handle(RenameServerCommand request, CancellationToken cancellationToken)
    {
        var nameResult = ServerName.Create(request.Name);

        if (nameResult.IsFailed)
        {
            return Result.Fail(nameResult.Errors);
        }

        var server = await serverRepository.GetByIdAsync(request.ServerId, cancellationToken);

        if (server is null)
        {
            return Result.Fail("Servidor não encontrado.");
        }

        if (server.OwnerId != request.RequestingUserId)
        {
            return Result.Fail("Apenas o dono do servidor pode renomeá-lo.");
        }

        server.Rename(nameResult.Value);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
