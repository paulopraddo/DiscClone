using DiscClone.Application.Servers.Commands.LeaveServer;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Servers;

public class LeaveServerCommandHandlerTests
{
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IServerMemberRepository> _serverMemberRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private LeaveServerCommandHandler CreateHandler() =>
        new(_serverRepository.Object, _serverMemberRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_ComMembroExistente_Sai()
    {
        var ownerId = Guid.NewGuid();
        var memberId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        server.AddMember(memberId);
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new LeaveServerCommand(server.Id, memberId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _serverMemberRepository.Verify(r => r.Remove(It.IsAny<ServerMember>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_QuandoRequisitanteEOOwner_RetornaFalha()
    {
        var ownerId = Guid.NewGuid();
        var server = Server.Create(ServerName.Create("Servidor").Value, ownerId).Value;
        _serverRepository.Setup(r => r.GetByIdAsync(server.Id, It.IsAny<CancellationToken>())).ReturnsAsync(server);

        var result = await CreateHandler().Handle(new LeaveServerCommand(server.Id, ownerId), CancellationToken.None);

        Assert.True(result.IsFailed);
        _serverMemberRepository.Verify(r => r.Remove(It.IsAny<ServerMember>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ComServidorInexistente_RetornaFalha()
    {
        _serverRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Server?)null);

        var result = await CreateHandler().Handle(new LeaveServerCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }
}
