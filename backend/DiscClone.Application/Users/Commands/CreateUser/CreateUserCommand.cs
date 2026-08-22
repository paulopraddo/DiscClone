using DiscClone.Application.Common;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.CreateUser;

public sealed record CreateUserCommand(string Username, string Email, string Password) : IRequest<Result<AuthResult>>;
