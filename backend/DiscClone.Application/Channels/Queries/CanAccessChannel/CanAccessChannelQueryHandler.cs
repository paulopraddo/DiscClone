using DiscClone.Domain.Channels;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Channels.Queries.CanAccessChannel;

public sealed class CanAccessChannelQueryHandler(
    IChannelRepository channelRepository,
    IServerMemberRepository serverMemberRepository)
    : IRequestHandler<CanAccessChannelQuery, Result<bool>>
{
    public async Task<Result<bool>> Handle(CanAccessChannelQuery request, CancellationToken cancellationToken)
    {
        var channel = await channelRepository.GetByIdAsync(request.ChannelId, cancellationToken);

        if (channel is null)
        {
            return Result.Ok(false);
        }

        var isMember = await serverMemberRepository.ExistsAsync(channel.ServerId, request.UserId, cancellationToken);
        return Result.Ok(isMember);
    }
}
