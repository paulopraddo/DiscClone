using DiscClone.Application.Common;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.VerifyEmail;

public sealed record VerifyEmailCommand(string Email, string Code) : IRequest<Result<AuthResult>>;
