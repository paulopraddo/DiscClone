using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Commands.RenameChannel;

public sealed class RenameChannelCommandHandler(
    IServerRepository serverRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<RenameChannelCommand, Result>
{
    public async Task<Result> Handle(RenameChannelCommand request, CancellationToken cancellationToken)
    {
        var nameResult = ChannelName.Create(request.Name);

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
            return Result.Fail("Apenas o dono do servidor pode renomear canais.");
        }

        var channel = server.Channels.FirstOrDefault(c => c.Id == request.ChannelId);

        if (channel is null)
        {
            return Result.Fail("Canal não encontrado.");
        }

        channel.Rename(nameResult.Value);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
