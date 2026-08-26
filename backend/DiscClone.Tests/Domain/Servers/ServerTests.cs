using DiscClone.Domain.Channels;
using DiscClone.Domain.Servers;

namespace DiscClone.Tests.Domain.Servers;

public class ServerTests
{
    private static Server CreateServer(out Guid ownerId)
    {
        ownerId = Guid.NewGuid();
        var name = ServerName.Create("Servidor de Teste").Value;
        return Server.Create(name, ownerId).Value;
    }

    [Fact]
    public void Create_AdicionaOOwnerComoMembro()
    {
        var server = CreateServer(out var ownerId);

        Assert.Single(server.Members);
        Assert.Equal(ownerId, server.Members.Single().UserId);
    }

    [Fact]
    public void AddMember_ComUsuarioNovo_Adiciona()
    {
        var server = CreateServer(out _);
        var newUserId = Guid.NewGuid();

        var result = server.AddMember(newUserId);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, server.Members.Count);
    }

    [Fact]
    public void AddMember_ComUsuarioJaMembro_RetornaFalha()
    {
        var server = CreateServer(out var ownerId);

        var result = server.AddMember(ownerId);

        Assert.True(result.IsFailed);
        Assert.Single(server.Members);
    }

    [Fact]
    public void AddChannel_ComNomeValido_Adiciona()
    {
        var server = CreateServer(out _);
        var name = ChannelName.Create("geral").Value;

        var result = server.AddChannel(name, ChannelType.Text);

        Assert.True(result.IsSuccess);
        Assert.Single(server.Channels);
        Assert.Equal(server.Id, result.Value.ServerId);
    }

    [Fact]
    public void RemoveChannel_ComCanalExistente_Remove()
    {
        var server = CreateServer(out _);
        var channel = server.AddChannel(ChannelName.Create("geral").Value, ChannelType.Text).Value;

        var result = server.RemoveChannel(channel.Id);

        Assert.True(result.IsSuccess);
        Assert.Empty(server.Channels);
    }

    [Fact]
    public void RemoveChannel_ComCanalInexistente_RetornaFalha()
    {
        var server = CreateServer(out _);

        var result = server.RemoveChannel(Guid.NewGuid());

        Assert.True(result.IsFailed);
    }

    [Fact]
    public void RemoveMember_ComMembroExistente_Remove()
    {
        var server = CreateServer(out _);
        var memberId = Guid.NewGuid();
        server.AddMember(memberId);

        var result = server.RemoveMember(memberId);

        Assert.True(result.IsSuccess);
        Assert.DoesNotContain(server.Members, m => m.UserId == memberId);
    }

    [Fact]
    public void RemoveMember_ComOwner_RetornaFalha()
    {
        var server = CreateServer(out var ownerId);

        var result = server.RemoveMember(ownerId);

        Assert.True(result.IsFailed);
        Assert.Single(server.Members);
    }

    [Fact]
    public void RemoveMember_ComUsuarioQueNaoEMembro_RetornaFalha()
    {
        var server = CreateServer(out _);

        var result = server.RemoveMember(Guid.NewGuid());

        Assert.True(result.IsFailed);
    }
}
