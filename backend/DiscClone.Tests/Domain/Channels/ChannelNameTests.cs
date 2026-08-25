using DiscClone.Domain.Channels;

namespace DiscClone.Tests.Domain.Channels;

public class ChannelNameTests
{
    [Fact]
    public void Create_ComNomeValido_RetornaSucesso()
    {
        var result = ChannelName.Create("geral");

        Assert.True(result.IsSuccess);
        Assert.Equal("geral", result.Value.Value);
    }

    [Fact]
    public void Create_ComNomeCurtoDemais_RetornaFalha()
    {
        var result = ChannelName.Create("a");

        Assert.True(result.IsFailed);
    }
}
