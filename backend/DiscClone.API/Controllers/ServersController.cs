using System.Security.Claims;
using DiscClone.Application.Channels.Commands.CreateChannel;
using DiscClone.Application.Channels.Commands.DeleteChannel;
using DiscClone.Application.Servers.Commands.CreateServer;
using DiscClone.Application.Servers.Commands.DeleteServer;
using DiscClone.Application.Servers.Commands.JoinServer;
using DiscClone.Application.Servers.Commands.LeaveServer;
using DiscClone.Application.Servers.Commands.RenameServer;
using DiscClone.Application.Servers.Queries.GetMyServers;
using DiscClone.Domain.Channels;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscClone.API.Controllers;

[ApiController]
[Authorize]
[Route("api/servers")]
public sealed class ServersController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyServers(CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetMyServersQuery(GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> CreateServer(CreateServerRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new CreateServerCommand(request.Name, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok(result.Value);
    }

    [HttpPost("{serverId:guid}/join")]
    public async Task<IActionResult> JoinServer(Guid serverId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new JoinServerCommand(serverId, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok();
    }

    [HttpPost("{serverId:guid}/leave")]
    public async Task<IActionResult> LeaveServer(Guid serverId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new LeaveServerCommand(serverId, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok();
    }

    [HttpPatch("{serverId:guid}")]
    public async Task<IActionResult> RenameServer(
        Guid serverId, RenameServerRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RenameServerCommand(serverId, request.Name, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok();
    }

    [HttpDelete("{serverId:guid}")]
    public async Task<IActionResult> DeleteServer(Guid serverId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteServerCommand(serverId, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok();
    }

    [HttpDelete("{serverId:guid}/channels/{channelId:guid}")]
    public async Task<IActionResult> DeleteChannel(Guid serverId, Guid channelId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteChannelCommand(serverId, channelId, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok();
    }

    [HttpPost("{serverId:guid}/channels")]
    public async Task<IActionResult> CreateChannel(
        Guid serverId, CreateChannelRequest request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<ChannelType>(request.Type, ignoreCase: true, out var type))
        {
            return BadRequest(new[] { "Tipo de canal inválido. Use 'text' ou 'voice'." });
        }

        var result = await sender.Send(
            new CreateChannelCommand(serverId, request.Name, type, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok(result.Value);
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

public sealed record CreateServerRequest(string Name);

public sealed record RenameServerRequest(string Name);

public sealed record CreateChannelRequest(string Name, string Type);
