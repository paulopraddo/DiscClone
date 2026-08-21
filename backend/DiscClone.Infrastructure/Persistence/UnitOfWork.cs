using DiscClone.Domain.Common;

namespace DiscClone.Infrastructure.Persistence;

public sealed class UnitOfWork(DiscCloneDbContext dbContext) : IUnitOfWork
{
    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
