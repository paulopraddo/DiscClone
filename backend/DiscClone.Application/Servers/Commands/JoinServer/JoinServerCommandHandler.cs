using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.JoinServer;

public sealed class JoinServerCommandHandler(
    IServerRepository serverRepository,
    IServerMemberRepository serverMemberRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<JoinServerCommand, Result>
{
    public async Task<Result> Handle(JoinServerCommand request, CancellationToken cancellationToken)
    {
        var server = await serverRepository.GetByIdAsync(request.ServerId, cancellationToken);

        if (server is null)
        {
            return Result.Fail("Servidor não encontrado.");
        }

        var memberResult = server.AddMember(request.UserId);

        if (memberResult.IsFailed)
        {
            return memberResult.ToResult();
        }

        await serverMemberRepository.AddAsync(memberResult.Value, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
