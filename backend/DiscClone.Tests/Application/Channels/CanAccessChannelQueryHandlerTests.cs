using DiscClone.Application.Channels.Queries.CanAccessChannel;
using DiscClone.Domain.Channels;
using DiscClone.Domain.Servers;
using Moq;

namespace DiscClone.Tests.Application.Channels;

public class CanAccessChannelQueryHandlerTests
{
    private readonly Mock<IChannelRepository> _channelRepository = new();
    private readonly Mock<IServerMemberRepository> _serverMemberRepository = new();

    private CanAccessChannelQueryHandler CreateHandler() =>
        new(_channelRepository.Object, _serverMemberRepository.Object);

    [Fact]
    public async Task Handle_QuandoUsuarioEMembroDoServidor_RetornaTrue()
    {
        var channel = Channel.Create(Guid.NewGuid(), ChannelName.Create("geral").Value, ChannelType.Text).Value;
        var userId = Guid.NewGuid();
        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverMemberRepository.Setup(r => r.ExistsAsync(channel.ServerId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await CreateHandler().Handle(new CanAccessChannelQuery(channel.Id, userId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
    }

    [Fact]
    public async Task Handle_QuandoUsuarioNaoEMembro_RetornaFalse()
    {
        var channel = Channel.Create(Guid.NewGuid(), ChannelName.Create("geral").Value, ChannelType.Text).Value;
        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverMemberRepository.Setup(r => r.ExistsAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await CreateHandler().Handle(new CanAccessChannelQuery(channel.Id, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.False(result.Value);
    }

    [Fact]
    public async Task Handle_ComCanalInexistente_RetornaFalse()
    {
        _channelRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Channel?)null);

        var result = await CreateHandler().Handle(new CanAccessChannelQuery(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.False(result.Value);
    }
}
