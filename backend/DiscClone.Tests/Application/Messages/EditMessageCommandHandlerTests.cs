using DiscClone.Application.Messages.Commands.EditMessage;
using DiscClone.Domain.Common;
using DiscClone.Domain.Messages;
using Moq;

namespace DiscClone.Tests.Application.Messages;

public class EditMessageCommandHandlerTests
{
    private readonly Mock<IMessageRepository> _messageRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private EditMessageCommandHandler CreateHandler() =>
        new(_messageRepository.Object, _unitOfWork.Object);

    private static Message CreateMessage(Guid authorId) =>
        Message.Create(Guid.NewGuid(), authorId, MessageContent.Create("oi").Value).Value;

    [Fact]
    public async Task Handle_QuandoRequisitanteEOAutor_Edita()
    {
        var authorId = Guid.NewGuid();
        var message = CreateMessage(authorId);
        _messageRepository.Setup(r => r.GetByIdAsync(message.Id, It.IsAny<CancellationToken>())).ReturnsAsync(message);

        var result = await CreateHandler().Handle(
            new EditMessageCommand(message.Id, "editada", authorId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(message.ChannelId, result.Value.ChannelId);
        Assert.Equal("editada", message.Content.Value);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteNaoEOAutor_RetornaFalha()
    {
        var message = CreateMessage(Guid.NewGuid());
        _messageRepository.Setup(r => r.GetByIdAsync(message.Id, It.IsAny<CancellationToken>())).ReturnsAsync(message);

        var result = await CreateHandler().Handle(
            new EditMessageCommand(message.Id, "editada", Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        Assert.Equal("oi", message.Content.Value);
    }

    [Fact]
    public async Task Handle_ComMensagemInexistente_RetornaFalha()
    {
        _messageRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Message?)null);

        var result = await CreateHandler().Handle(
            new EditMessageCommand(Guid.NewGuid(), "editada", Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_ComConteudoVazio_RetornaFalhaSemConsultarMensagem()
    {
        var result = await CreateHandler().Handle(
            new EditMessageCommand(Guid.NewGuid(), "   ", Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _messageRepository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
