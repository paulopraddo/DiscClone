using DiscClone.Application.Channels.Commands.CreateChannel;
using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Channels;

public class CreateChannelCommandHandlerTests
{
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IChannelRepository> _channelRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private CreateChannelCommandHandler CreateHandler() =>
        new(_serverRepository.Object, _channelRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_QuandoRequisitanteEOOwner_CriaCanal()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new CreateChannelCommand(server.Id, "geral", ChannelType.Text, ownerId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _channelRepository.Verify(r => r.AddAsync(It.IsAny<Channel>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteNaoEOOwner_RetornaFalha()
    {
        var server = Server.Create(ServerName.Create("Servidor").Value, Guid.NewGuid()).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new CreateChannelCommand(server.Id, "geral", ChannelType.Text, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _channelRepository.Verify(r => r.AddAsync(It.IsAny<Channel>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ComServidorInexistente_RetornaFalha()
    {
        _serverRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Server?)null);

        var result = await CreateHandler().Handle(
            new CreateChannelCommand(Guid.NewGuid(), "geral", ChannelType.Text, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_ComNomeInvalido_RetornaFalhaSemConsultarServidor()
    {
        var result = await CreateHandler().Handle(
            new CreateChannelCommand(Guid.NewGuid(), "a", ChannelType.Text, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _serverRepository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
