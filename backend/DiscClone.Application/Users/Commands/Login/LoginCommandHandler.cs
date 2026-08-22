using DiscClone.Application.Common;
using DiscClone.Domain.Users;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.Login;

public sealed class LoginCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService)
    : IRequestHandler<LoginCommand, Result<AuthResult>>
{
    private const string InvalidCredentialsMessage = "E-mail ou senha inválidos.";

    public async Task<Result<AuthResult>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var emailResult = Email.Create(request.Email);

        if (emailResult.IsFailed)
        {
            return Result.Fail<AuthResult>(InvalidCredentialsMessage);
        }

        var user = await userRepository.GetByEmailAsync(emailResult.Value, cancellationToken);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result.Fail<AuthResult>(InvalidCredentialsMessage);
        }

        var token = tokenService.GenerateToken(user);
        return Result.Ok(new AuthResult(user.Id, user.Username.Value, token));
    }
}
