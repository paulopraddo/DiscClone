using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Messages;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Commands.DeleteMessage;

public sealed class DeleteMessageCommandHandler(
    IMessageRepository messageRepository,
    IChannelRepository channelRepository,
    IServerRepository serverRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMessageCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var message = await messageRepository.GetByIdAsync(request.MessageId, cancellationToken);

        if (message is null)
        {
            return Result.Fail<Guid>("Mensagem não encontrada.");
        }

        if (message.AuthorId != request.RequestingUserId)
        {
            var canModerate = await CanModerateAsync(message.ChannelId, request.RequestingUserId, cancellationToken);

            if (!canModerate)
            {
                return Result.Fail<Guid>("Você não pode apagar esta mensagem.");
            }
        }

        var channelId = message.ChannelId;

        messageRepository.Remove(message);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(channelId);
    }

    private async Task<bool> CanModerateAsync(Guid channelId, Guid userId, CancellationToken cancellationToken)
    {
        var channel = await channelRepository.GetByIdAsync(channelId, cancellationToken);

        if (channel is null)
        {
            return false;
        }

        var server = await serverRepository.GetByIdAsync(channel.ServerId, cancellationToken);

        return server is not null && server.OwnerId == userId;
    }
}
