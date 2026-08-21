using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Users;

public sealed class User : Entity
{
    public Username Username { get; private set; }
    public Email Email { get; private set; }
    public DateTime CreatedAt { get; }

    private User(Guid id, Username username, Email email, DateTime createdAt)
        : base(id)
    {
        Username = username;
        Email = email;
        CreatedAt = createdAt;
    }

    public static Result<User> Create(Username username, Email email)
    {
        return Result.Ok(new User(Guid.NewGuid(), username, email, DateTime.UtcNow));
    }

    public void ChangeUsername(Username username)
    {
        Username = username;
    }
}
