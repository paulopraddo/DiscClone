namespace DiscClone.Application.Messages.Queries.GetChannelMessages;

public sealed record MessageSummary(
    Guid Id, Guid AuthorId, string AuthorUsername, string Content, DateTime SentAt, DateTime? EditedAt);
