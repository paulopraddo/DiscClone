using DiscClone.Domain.Users;

namespace DiscClone.Tests.Domain.Users;

public class UserTests
{
    private static User CreateUser()
    {
        var username = Username.Create("joao").Value;
        var email = Email.Create("joao@example.com").Value;
        return User.Create(username, email, "hash").Value;
    }

    [Fact]
    public void Create_ComeaNaoVerificado()
    {
        var user = CreateUser();

        Assert.False(user.IsEmailVerified);
    }

    [Fact]
    public void VerifyEmail_ComCodigoCorretoENaoExpirado_Verifica()
    {
        var user = CreateUser();
        user.SetVerificationCode("123456", DateTime.UtcNow.AddMinutes(15));

        var result = user.VerifyEmail("123456");

        Assert.True(result.IsSuccess);
        Assert.True(user.IsEmailVerified);
        Assert.Null(user.VerificationCode);
        Assert.Null(user.VerificationCodeExpiresAt);
    }

    [Fact]
    public void VerifyEmail_ComCodigoErrado_RetornaFalhaENaoVerifica()
    {
        var user = CreateUser();
        user.SetVerificationCode("123456", DateTime.UtcNow.AddMinutes(15));

        var result = user.VerifyEmail("000000");

        Assert.True(result.IsFailed);
        Assert.False(user.IsEmailVerified);
    }

    [Fact]
    public void VerifyEmail_ComCodigoExpirado_RetornaFalha()
    {
        var user = CreateUser();
        user.SetVerificationCode("123456", DateTime.UtcNow.AddMinutes(-1));

        var result = user.VerifyEmail("123456");

        Assert.True(result.IsFailed);
        Assert.False(user.IsEmailVerified);
    }

    [Fact]
    public void VerifyEmail_SemCodigoPendente_RetornaFalha()
    {
        var user = CreateUser();

        var result = user.VerifyEmail("123456");

        Assert.True(result.IsFailed);
    }

    [Fact]
    public void VerifyEmail_QuandoJaVerificado_RetornaSucessoSemAlterarNada()
    {
        var user = CreateUser();
        user.SetVerificationCode("123456", DateTime.UtcNow.AddMinutes(15));
        user.VerifyEmail("123456");

        var result = user.VerifyEmail("000000");

        Assert.True(result.IsSuccess);
        Assert.True(user.IsEmailVerified);
    }
}
