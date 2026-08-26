using DiscClone.Domain.Common;
using DiscClone.Domain.Messages;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Commands.EditMessage;

public sealed class EditMessageCommandHandler(
    IMessageRepository messageRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<EditMessageCommand, Result<EditMessageResult>>
{
    public async Task<Result<EditMessageResult>> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        var contentResult = MessageContent.Create(request.Content);

        if (contentResult.IsFailed)
        {
            return Result.Fail<EditMessageResult>(contentResult.Errors);
        }

        var message = await messageRepository.GetByIdAsync(request.MessageId, cancellationToken);

        if (message is null)
        {
            return Result.Fail<EditMessageResult>("Mensagem não encontrada.");
        }

        if (message.AuthorId != request.RequestingUserId)
        {
            return Result.Fail<EditMessageResult>("Você só pode editar suas próprias mensagens.");
        }

        message.Edit(contentResult.Value);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(new EditMessageResult(message.ChannelId, message.EditedAt!.Value));
    }
}
