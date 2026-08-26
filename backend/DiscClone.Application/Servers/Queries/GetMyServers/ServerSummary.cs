namespace DiscClone.Application.Servers.Queries.GetMyServers;

public sealed record ServerSummary(Guid Id, string Name, Guid OwnerId, IReadOnlyList<ChannelSummary> Channels);
