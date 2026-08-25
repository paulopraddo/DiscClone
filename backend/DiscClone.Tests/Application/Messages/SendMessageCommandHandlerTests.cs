using DiscClone.Application.Messages.Commands.SendMessage;
using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Messages;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Messages;

public class SendMessageCommandHandlerTests
{
    private readonly Mock<IChannelRepository> _channelRepository = new();
    private readonly Mock<IServerMemberRepository> _serverMemberRepository = new();
    private readonly Mock<IMessageRepository> _messageRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private SendMessageCommandHandler CreateHandler() =>
        new(_channelRepository.Object, _serverMemberRepository.Object, _messageRepository.Object, _unitOfWork.Object);

    private Channel CreateChannel() => Channel.Create(Guid.NewGuid(), ChannelName.Create("geral").Value, ChannelType.Text).Value;

    [Fact]
    public async Task Handle_QuandoUsuarioEMembro_EnviaMensagem()
    {
        var channel = CreateChannel();
        var authorId = Guid.NewGuid();
        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverMemberRepository.Setup(r => r.ExistsAsync(channel.ServerId, authorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await CreateHandler().Handle(new SendMessageCommand(channel.Id, authorId, "oi"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _messageRepository.Verify(r => r.AddAsync(It.IsAny<Message>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoUsuarioNaoEMembro_RetornaFalha()
    {
        var channel = CreateChannel();
        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverMemberRepository.Setup(r => r.ExistsAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await CreateHandler().Handle(new SendMessageCommand(channel.Id, Guid.NewGuid(), "oi"), CancellationToken.None);

        Assert.True(result.IsFailed);
        _messageRepository.Verify(r => r.AddAsync(It.IsAny<Message>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ComCanalInexistente_RetornaFalha()
    {
        _channelRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Channel?)null);

        var result = await CreateHandler().Handle(new SendMessageCommand(Guid.NewGuid(), Guid.NewGuid(), "oi"), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_ComConteudoVazio_RetornaFalhaSemConsultarCanal()
    {
        var result = await CreateHandler().Handle(new SendMessageCommand(Guid.NewGuid(), Guid.NewGuid(), "   "), CancellationToken.None);

        Assert.True(result.IsFailed);
        _channelRepository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
