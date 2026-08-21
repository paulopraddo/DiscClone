using DiscClone.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace DiscClone.Infrastructure.Persistence.Repositories;

public sealed class UserRepository(DiscCloneDbContext dbContext) : IUserRepository
{
    public Task<bool> ExistsByUsernameAsync(Username username, CancellationToken cancellationToken = default) =>
        dbContext.Users.AnyAsync(u => u.Username == username, cancellationToken);

    public Task<bool> ExistsByEmailAsync(Email email, CancellationToken cancellationToken = default) =>
        dbContext.Users.AnyAsync(u => u.Email == email, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default) =>
        await dbContext.Users.AddAsync(user, cancellationToken);
}
