using DiscClone.Application.Channels.Commands.DeleteChannel;
using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Channels;

public class DeleteChannelCommandHandlerTests
{
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IChannelRepository> _channelRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private DeleteChannelCommandHandler CreateHandler() =>
        new(_serverRepository.Object, _channelRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_QuandoRequisitanteEOOwner_Deleta()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        var channel = server.AddChannel(ChannelName.Create("geral").Value, ChannelType.Text).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new DeleteChannelCommand(server.Id, channel.Id, ownerId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _channelRepository.Verify(r => r.Remove(channel), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteNaoEOOwner_RetornaFalha()
    {
        var server = Server.Create(ServerName.Create("Servidor").Value, Guid.NewGuid()).Value;
        var channel = server.AddChannel(ChannelName.Create("geral").Value, ChannelType.Text).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new DeleteChannelCommand(server.Id, channel.Id, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _channelRepository.Verify(r => r.Remove(It.IsAny<Channel>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ComCanalInexistente_RetornaFalha()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new DeleteChannelCommand(server.Id, Guid.NewGuid(), ownerId), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_ComServidorInexistente_RetornaFalha()
    {
        _serverRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Server?)null);

        var result = await CreateHandler().Handle(
            new DeleteChannelCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }
}
