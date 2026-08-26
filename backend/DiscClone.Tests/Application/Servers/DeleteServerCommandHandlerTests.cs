using DiscClone.Application.Servers.Commands.DeleteServer;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Servers;

public class DeleteServerCommandHandlerTests
{
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private DeleteServerCommandHandler CreateHandler() =>
        new(_serverRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_QuandoRequisitanteEOOwner_Deleta()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new DeleteServerCommand(server.Id, ownerId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _serverRepository.Verify(r => r.Remove(server), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteNaoEOOwner_RetornaFalha()
    {
        var server = Server.Create(ServerName.Create("Servidor").Value, Guid.NewGuid()).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new DeleteServerCommand(server.Id, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _serverRepository.Verify(r => r.Remove(It.IsAny<Server>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ComServidorInexistente_RetornaFalha()
    {
        _serverRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Server?)null);

        var result = await CreateHandler().Handle(new DeleteServerCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }
}
