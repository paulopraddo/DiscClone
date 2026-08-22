using DiscClone.Application.Common;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.Login;

public sealed record LoginCommand(string Email, string Password) : IRequest<Result<AuthResult>>;
