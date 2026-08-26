using DiscClone.Application.Channels.Commands.RenameChannel;
using DiscClone.Domain.Channels;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Channels;

public class RenameChannelCommandHandlerTests
{
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private RenameChannelCommandHandler CreateHandler() =>
        new(_serverRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_QuandoRequisitanteEOOwner_Renomeia()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        var channel = server.AddChannel(ChannelName.Create("geral").Value, ChannelType.Text).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new RenameChannelCommand(server.Id, channel.Id, "anuncios", ownerId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("anuncios", channel.Name.Value);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteNaoEOOwner_RetornaFalha()
    {
        var server = Server.Create(ServerName.Create("Servidor").Value, Guid.NewGuid()).Value;
        var channel = server.AddChannel(ChannelName.Create("geral").Value, ChannelType.Text).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new RenameChannelCommand(server.Id, channel.Id, "anuncios", Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        Assert.Equal("geral", channel.Name.Value);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ComCanalInexistente_RetornaFalha()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(
            new RenameChannelCommand(server.Id, Guid.NewGuid(), "anuncios", ownerId), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_ComServidorInexistente_RetornaFalha()
    {
        _serverRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Server?)null);

        var result = await CreateHandler().Handle(
            new RenameChannelCommand(Guid.NewGuid(), Guid.NewGuid(), "anuncios", Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_ComNomeInvalido_RetornaFalhaSemConsultarServidor()
    {
        var result = await CreateHandler().Handle(
            new RenameChannelCommand(Guid.NewGuid(), Guid.NewGuid(), "a", Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _serverRepository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
