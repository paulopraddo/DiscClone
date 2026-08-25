using DiscClone.Domain.Servers;

namespace DiscClone.Tests.Domain.Servers;

public class ServerNameTests
{
    [Fact]
    public void Create_ComNomeValido_RetornaSucesso()
    {
        var result = ServerName.Create("Meu Servidor");

        Assert.True(result.IsSuccess);
        Assert.Equal("Meu Servidor", result.Value.Value);
    }

    [Fact]
    public void Create_ComNomeCurtoDemais_RetornaFalha()
    {
        var result = ServerName.Create("a");

        Assert.True(result.IsFailed);
    }

    [Fact]
    public void Create_ComNomeLongoDemais_RetornaFalha()
    {
        var result = ServerName.Create(new string('a', ServerName.MaxLength + 1));

        Assert.True(result.IsFailed);
    }
}
