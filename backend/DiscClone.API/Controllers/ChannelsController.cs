using System.Security.Claims;
using DiscClone.Application.Messages.Queries.GetChannelMessages;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscClone.API.Controllers;

[ApiController]
[Authorize]
[Route("api/channels")]
public sealed class ChannelsController(ISender sender) : ControllerBase
{
    [HttpGet("{channelId:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid channelId, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetChannelMessagesQuery(channelId, GetUserId()), cancellationToken);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors.Select(e => e.Message));
        }

        return Ok(result.Value);
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
