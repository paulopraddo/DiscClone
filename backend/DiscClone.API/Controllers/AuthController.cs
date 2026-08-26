using DiscClone.Application.Users.Commands.CreateUser;
using DiscClone.Application.Users.Commands.Login;
using DiscClone.Application.Users.Commands.ResendVerificationCode;
using DiscClone.Application.Users.Commands.VerifyEmail;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DiscClone.API.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public sealed class AuthController(ISender sender) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new CreateUserCommand(request.Username, request.Email, request.Password), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok(result.Value);
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(VerifyEmailRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new VerifyEmailCommand(request.Email, request.Code), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok(result.Value);
    }

    [HttpPost("resend-code")]
    public async Task<IActionResult> ResendCode(ResendCodeRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ResendVerificationCodeCommand(request.Email), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new LoginCommand(request.Email, request.Password), cancellationToken);

        if (result.IsFailed)
        {
            return Unauthorized(result.Errors.Select(e => e.Message));
        }

        return Ok(result.Value);
    }
}

public sealed record RegisterRequest(string Username, string Email, string Password);

public sealed record VerifyEmailRequest(string Email, string Code);

public sealed record ResendCodeRequest(string Email);

public sealed record LoginRequest(string Email, string Password);
