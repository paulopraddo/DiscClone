using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.CreateUser;

public sealed record CreateUserCommand(string Username, string Email) : IRequest<Result<Guid>>;
