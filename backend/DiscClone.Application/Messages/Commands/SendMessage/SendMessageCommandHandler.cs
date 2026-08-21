using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Messages;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Commands.SendMessage;

public sealed class SendMessageCommandHandler(
    IChannelRepository channelRepository,
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

        if (!await channelRepository.ExistsAsync(request.ChannelId, cancellationToken))
        {
            return Result.Fail<Guid>("Canal não encontrado.");
        }

        var message = Message.Create(request.ChannelId, request.AuthorId, contentResult.Value).Value;

        await messageRepository.AddAsync(message, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(message.Id);
    }
}
