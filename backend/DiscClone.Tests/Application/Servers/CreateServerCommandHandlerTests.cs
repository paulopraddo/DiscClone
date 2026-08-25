using DiscClone.Application.Servers.Commands.CreateServer;
using DiscClone.Domain.Common;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Servers;

public class CreateServerCommandHandlerTests
{
    private readonly Mock<IServerRepository> _serverRepository = new();
    private readonly Mock<IServerMemberRepository> _serverMemberRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private CreateServerCommandHandler CreateHandler() =>
        new(_serverRepository.Object, _serverMemberRepository.Object, _unitOfWork.Object);

    [Fact]
    public async Task Handle_ComNomeValido_CriaServidorComOwnerComoMembro()
    {
        var ownerId = Guid.NewGuid();

        var result = await CreateHandler().Handle(new CreateServerCommand("Meu Servidor", ownerId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        _serverRepository.Verify(r => r.AddAsync(It.IsAny<Server>(), It.IsAny<CancellationToken>()), Times.Once);
        _serverMemberRepository.Verify(
            r => r.AddAsync(It.Is<ServerMember>(m => m.UserId == ownerId), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ComNomeInvalido_RetornaFalhaSemPersistir()
    {
        var result = await CreateHandler().Handle(new CreateServerCommand("a", Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
        _serverRepository.Verify(r => r.AddAsync(It.IsAny<Server>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
