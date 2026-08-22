namespace DiscClone.Application.Servers.Queries.GetMyServers;

public sealed record ServerSummary(Guid Id, string Name, IReadOnlyList<ChannelSummary> Channels);
