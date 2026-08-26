using DiscClone.Domain.Channels;
using DiscClone.Domain.Servers;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Servers.Queries.GetMyServers;

public sealed class GetMyServersQueryHandler(IServerRepository serverRepository)
    : IRequestHandler<GetMyServersQuery, Result<IReadOnlyList<ServerSummary>>>
{
    public async Task<Result<IReadOnlyList<ServerSummary>>> Handle(GetMyServersQuery request, CancellationToken cancellationToken)
    {
        var servers = await serverRepository.GetByMemberUserIdAsync(request.UserId, cancellationToken);

        var summaries = servers
            .Select(server => new ServerSummary(
                server.Id,
                server.Name.Value,
                server.OwnerId,
                server.Channels
                    .Select(channel => new ChannelSummary(
                        channel.Id,
                        channel.Name.Value,
                        channel.Type == ChannelType.Voice ? "voice" : "text"))
                    .ToList()))
            .ToList();

        return Result.Ok<IReadOnlyList<ServerSummary>>(summaries);
    }
}
