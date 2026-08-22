using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Commands.CreateServer;

public sealed class CreateServerCommandHandler(
    IServerRepository serverRepository,
    IServerMemberRepository serverMemberRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateServerCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateServerCommand request, CancellationToken cancellationToken)
    {
        var nameResult = ServerName.Create(request.Name);

        if (nameResult.IsFailed)
        {
            return Result.Fail<Guid>(nameResult.Errors);
        }

        var server = Server.Create(nameResult.Value, request.OwnerId).Value;

        await serverRepository.AddAsync(server, cancellationToken);
        await serverMemberRepository.AddAsync(server.Members.Single(), cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(server.Id);
    }
}
