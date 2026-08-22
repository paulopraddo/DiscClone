namespace DiscClone.Application.Common;

public sealed record AuthResult(Guid UserId, string Username, string Token);
