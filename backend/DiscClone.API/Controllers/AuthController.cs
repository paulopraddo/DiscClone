using DiscClone.Application.Users.Commands.CreateUser;
using DiscClone.Application.Users.Commands.Login;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DiscClone.API.Controllers;

[ApiController]
[Route("api/auth")]
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

public sealed record LoginRequest(string Email, string Password);
