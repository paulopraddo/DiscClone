using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.LeaveServer;

public sealed class LeaveServerCommandHandler(
    IServerRepository serverRepository,
    IServerMemberRepository serverMemberRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<LeaveServerCommand, Result>
{
    public async Task<Result> Handle(LeaveServerCommand request, CancellationToken cancellationToken)
    {
        var server = await serverRepository.GetByIdAsync(request.ServerId, cancellationToken);

        if (server is null)
        {
            return Result.Fail("Servidor não encontrado.");
        }

        var removeResult = server.RemoveMember(request.RequestingUserId);

        if (removeResult.IsFailed)
        {
            return Result.Fail(removeResult.Errors);
        }

        serverMemberRepository.Remove(removeResult.Value);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
