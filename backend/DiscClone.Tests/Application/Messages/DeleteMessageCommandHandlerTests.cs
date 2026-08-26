using DiscClone.Application.Messages.Commands.DeleteMessage;
using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Messages;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Messages;

public class DeleteMessageCommandHandlerTests
{
    private readonly Mock<IMessageRepository> _messageRepository = new();
    private readonly Mock<IChannelRepository> _channelRepository = new();
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private DeleteMessageCommandHandler CreateHandler() =>
        new(_messageRepository.Object, _channelRepository.Object, _serverRepository.Object, _unitOfWork.Object);

    private static Message CreateMessage(Guid authorId, Guid channelId) =>
        Message.Create(channelId, authorId, MessageContent.Create("oi").Value).Value;

    [Fact]
    public async Task Handle_QuandoRequisitanteEOAutor_Deleta()
    {
        var authorId = Guid.NewGuid();
        var message = CreateMessage(authorId, Guid.NewGuid());
        _messageRepository.Setup(r => r.GetByIdAsync(message.Id, It.IsAny<CancellationToken>())).ReturnsAsync(message);

        var result = await CreateHandler().Handle(new DeleteMessageCommand(message.Id, authorId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(message.ChannelId, result.Value);
        _messageRepository.Verify(r => r.Remove(message), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteEODonoDoServidor_Deleta()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        var channel = server.AddChannel(ChannelName.Create("geral").Value, ChannelType.Text).Value;
        var message = CreateMessage(Guid.NewGuid(), channel.Id);

        _messageRepository.Setup(r => r.GetByIdAsync(message.Id, It.IsAny<CancellationToken>())).ReturnsAsync(message);
        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new DeleteMessageCommand(message.Id, ownerId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _messageRepository.Verify(r => r.Remove(message), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteNaoEAutorNemDono_RetornaFalha()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        var channel = server.AddChannel(ChannelName.Create("geral").Value, ChannelType.Text).Value;
        var message = CreateMessage(Guid.NewGuid(), channel.Id);

        _messageRepository.Setup(r => r.GetByIdAsync(message.Id, It.IsAny<CancellationToken>())).ReturnsAsync(message);
        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new DeleteMessageCommand(message.Id, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _messageRepository.Verify(r => r.Remove(It.IsAny<Message>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ComMensagemInexistente_RetornaFalha()
    {
        _messageRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Message?)null);

        var result = await CreateHandler().Handle(new DeleteMessageCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }
}
