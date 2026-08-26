using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Commands.DeleteChannel;

public sealed class DeleteChannelCommandHandler(
    IServerRepository serverRepository,
    IChannelRepository channelRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteChannelCommand, Result>
{
    public async Task<Result> Handle(DeleteChannelCommand request, CancellationToken cancellationToken)
    {
        var server = await serverRepository.GetByIdAsync(request.ServerId, cancellationToken);

        if (server is null)
        {
            return Result.Fail("Servidor não encontrado.");
        }

        if (server.OwnerId != request.RequestingUserId)
        {
            return Result.Fail("Apenas o dono do servidor pode deletar canais.");
        }

        var removeResult = server.RemoveChannel(request.ChannelId);

        if (removeResult.IsFailed)
        {
            return Result.Fail(removeResult.Errors);
        }

        channelRepository.Remove(removeResult.Value);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
