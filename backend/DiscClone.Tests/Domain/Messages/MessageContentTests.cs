using DiscClone.Domain.Messages;

namespace DiscClone.Tests.Domain.Messages;

public class MessageContentTests
{
    [Fact]
    public void Create_ComTextoValido_RetornaSucesso()
    {
        var result = MessageContent.Create("Olá, mundo!");

        Assert.True(result.IsSuccess);
        Assert.Equal("Olá, mundo!", result.Value.Value);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_ComTextoVazio_RetornaFalha(string? value)
    {
        var result = MessageContent.Create(value!);

        Assert.True(result.IsFailed);
    }

    [Fact]
    public void Create_ComTextoLongoDemais_RetornaFalha()
    {
        var result = MessageContent.Create(new string('a', MessageContent.MaxLength + 1));

        Assert.True(result.IsFailed);
    }

    [Fact]
    public void Create_RemoveEspacosNasExtremidades()
    {
        var result = MessageContent.Create("  oi  ");

        Assert.Equal("oi", result.Value.Value);
    }
}
