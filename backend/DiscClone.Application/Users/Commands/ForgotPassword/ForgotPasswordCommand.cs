using FluentResults;
using MediatR;

namespace DiscClone.Application.Users.Commands.ForgotPassword;

public sealed record ForgotPasswordCommand(string Email) : IRequest<Result>;
