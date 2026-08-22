using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Messages;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Commands.SendMessage;

public sealed class SendMessageCommandHandler(
    IChannelRepository channelRepository,
    IServerMemberRepository serverMemberRepository,
    IMessageRepository messageRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<SendMessageCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var contentResult = MessageContent.Create(request.Content);

        if (contentResult.IsFailed)
        {
            return Result.Fail<Guid>(contentResult.Errors);
        }

        var channel = await channelRepository.GetByIdAsync(request.ChannelId, cancellationToken);

        if (channel is null)
        {
            return Result.Fail<Guid>("Canal não encontrado.");
        }

        var isMember = await serverMemberRepository.ExistsAsync(channel.ServerId, request.AuthorId, cancellationToken);

        if (!isMember)
        {
            return Result.Fail<Guid>("Você não tem acesso a este canal.");
        }

        var message = Message.Create(request.ChannelId, request.AuthorId, contentResult.Value).Value;

        await messageRepository.AddAsync(message, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(message.Id);
    }
}
