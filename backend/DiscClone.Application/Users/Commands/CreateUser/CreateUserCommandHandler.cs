using DiscClone.Application.Common;
using DiscClone.Domain.Common;
using DiscClone.Domain.Users;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.CreateUser;

public sealed class CreateUserCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateUserCommand, Result<AuthResult>>
{
    public async Task<Result<AuthResult>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var usernameResult = Username.Create(request.Username);
        var emailResult = Email.Create(request.Email);
        var passwordResult = Password.Create(request.Password);

        if (usernameResult.IsFailed || emailResult.IsFailed || passwordResult.IsFailed)
        {
            return Result.Fail<AuthResult>(
                usernameResult.Errors.Concat(emailResult.Errors).Concat(passwordResult.Errors));
        }

        if (await userRepository.ExistsByUsernameAsync(usernameResult.Value, cancellationToken))
        {
            return Result.Fail<AuthResult>("Já existe um usuário com esse nome de usuário.");
        }

        if (await userRepository.ExistsByEmailAsync(emailResult.Value, cancellationToken))
        {
            return Result.Fail<AuthResult>("Já existe um usuário com esse e-mail.");
        }

        var passwordHash = passwordHasher.Hash(passwordResult.Value.Value);
        var user = User.Create(usernameResult.Value, emailResult.Value, passwordHash).Value;

        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var token = tokenService.GenerateToken(user);
        return Result.Ok(new AuthResult(user.Id, user.Username.Value, token));
    }
}
