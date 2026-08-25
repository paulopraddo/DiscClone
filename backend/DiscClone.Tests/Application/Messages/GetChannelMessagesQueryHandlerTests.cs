using DiscClone.Application.Messages.Queries.GetChannelMessages;
using DiscClone.Domain.Channels;
using DiscClone.Domain.Messages;
using DiscClone.Domain.Servers;
using DiscClone.Domain.Users;
using Moq;

namespace DiscClone.Tests.Application.Messages;

public class GetChannelMessagesQueryHandlerTests
{
    private readonly Mock<IChannelRepository> _channelRepository = new();
    private readonly Mock<IServerMemberRepository> _serverMemberRepository = new();
    private readonly Mock<IMessageRepository> _messageRepository = new();
    private readonly Mock<IUserRepository> _userRepository = new();

    private GetChannelMessagesQueryHandler CreateHandler() =>
        new(_channelRepository.Object, _serverMemberRepository.Object, _messageRepository.Object, _userRepository.Object);

    private Channel CreateChannel() => Channel.Create(Guid.NewGuid(), ChannelName.Create("geral").Value, ChannelType.Text).Value;

    [Fact]
    public async Task Handle_QuandoUsuarioEMembro_RetornaMensagensComNomeDoAutor()
    {
        var channel = CreateChannel();
        var userId = Guid.NewGuid();
        var author = User.Create(Username.Create("joao").Value, Email.Create("joao@example.com").Value, "hash").Value;
        var message = Message.Create(channel.Id, author.Id, MessageContent.Create("oi").Value).Value;

        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverMemberRepository.Setup(r => r.ExistsAsync(channel.ServerId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _messageRepository.Setup(r => r.GetByChannelAsync(channel.Id, It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([message]);
        _userRepository.Setup(r => r.GetByIdsAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([author]);

        var result = await CreateHandler().Handle(new GetChannelMessagesQuery(channel.Id, userId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var summary = Assert.Single(result.Value);
        Assert.Equal("joao", summary.AuthorUsername);
        Assert.Equal("oi", summary.Content);
    }

    [Fact]
    public async Task Handle_ComAutorRemovido_UsaNomePadrao()
    {
        var channel = CreateChannel();
        var userId = Guid.NewGuid();
        var message = Message.Create(channel.Id, Guid.NewGuid(), MessageContent.Create("oi").Value).Value;

        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverMemberRepository.Setup(r => r.ExistsAsync(channel.ServerId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _messageRepository.Setup(r => r.GetByChannelAsync(channel.Id, It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([message]);
        _userRepository.Setup(r => r.GetByIdsAsync(It.IsAny<IReadOnlyCollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await CreateHandler().Handle(new GetChannelMessagesQuery(channel.Id, userId), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Usuário removido", result.Value.Single().AuthorUsername);
    }

    [Fact]
    public async Task Handle_QuandoUsuarioNaoEMembro_RetornaFalha()
    {
        var channel = CreateChannel();
        _channelRepository.Setup(r => r.GetByIdAsync(channel.Id, It.IsAny<CancellationToken>())).ReturnsAsync(channel);
        _serverMemberRepository.Setup(r => r.ExistsAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await CreateHandler().Handle(new GetChannelMessagesQuery(channel.Id, Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public async Task Handle_ComCanalInexistente_RetornaFalha()
    {
        _channelRepository.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Channel?)null);

        var result = await CreateHandler().Handle(new GetChannelMessagesQuery(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsFailed);
    }
}
