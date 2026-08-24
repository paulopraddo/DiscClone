using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.ResendVerificationCode;

public sealed record ResendVerificationCodeCommand(string Email) : IRequest<Result>;
