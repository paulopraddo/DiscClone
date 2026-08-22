using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Commands.CreateChannel;

public sealed class CreateChannelCommandHandler(
    IServerRepository serverRepository,
    IChannelRepository channelRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateChannelCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateChannelCommand request, CancellationToken cancellationToken)
    {
        var nameResult = ChannelName.Create(request.Name);

        if (nameResult.IsFailed)
        {
            return Result.Fail<Guid>(nameResult.Errors);
        }

        var server = await serverRepository.GetByIdAsync(request.ServerId, cancellationToken);

        if (server is null)
        {
            return Result.Fail<Guid>("Servidor não encontrado.");
        }

        if (server.OwnerId != request.RequestingUserId)
        {
            return Result.Fail<Guid>("Você não tem permissão para criar canais neste servidor.");
        }

        var channelResult = server.AddChannel(nameResult.Value, request.Type);

        if (channelResult.IsFailed)
        {
            return Result.Fail<Guid>(channelResult.Errors);
        }

        await channelRepository.AddAsync(channelResult.Value, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(channelResult.Value.Id);
    }
}
