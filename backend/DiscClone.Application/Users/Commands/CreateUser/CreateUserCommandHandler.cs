using DiscClone.Domain.Common;
using DiscClone.Domain.Users;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.CreateUser;

public sealed class CreateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var usernameResult = Username.Create(request.Username);
        var emailResult = Email.Create(request.Email);

        if (usernameResult.IsFailed || emailResult.IsFailed)
        {
            return Result.Fail<Guid>(usernameResult.Errors.Concat(emailResult.Errors));
        }

        if (await userRepository.ExistsByUsernameAsync(usernameResult.Value, cancellationToken))
        {
            return Result.Fail<Guid>("Já existe um usuário com esse nome de usuário.");
        }

        if (await userRepository.ExistsByEmailAsync(emailResult.Value, cancellationToken))
        {
            return Result.Fail<Guid>("Já existe um usuário com esse e-mail.");
        }

        var user = User.Create(usernameResult.Value, emailResult.Value).Value;

        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(user.Id);
    }
}
