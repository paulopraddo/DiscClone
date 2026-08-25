using DiscClone.Application.Servers.Commands.JoinServer;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Servers;

public class JoinServerCommandHandlerTests
{
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IServerMemberRepository> _serverMemberRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private JoinServerCommandHandler CreateHandler() =>
        new(_serverRepository.Object, _serverMemberRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_ComServidorExistenteEUsuarioNovo_Entra()
    {
        var server = Server.Create(ServerName.Create("Servidor").Value, Guid.NewGuid()).Value;
        var userId = Guid.NewGuid();
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new JoinServerCommand(server.Id, userId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _serverMemberRepository.Verify(r => r.AddAsync(It.IsAny<ServerMember>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ComServidorInexistente_RetornaFalha()
    {
        _serverRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Server?)null);

        var result = await CreateHandler().Handle(new JoinServerCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_QuandoUsuarioJaEMembro_RetornaFalha()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new JoinServerCommand(server.Id, ownerId), CancellationToken.None);

        Assert.True(result.IsFailed);
        _serverMemberRepository.Verify(r => r.AddAsync(It.IsAny<ServerMember>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
