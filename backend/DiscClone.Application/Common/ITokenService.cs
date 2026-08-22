using DiscClone.Domain.Users;

namespace DiscClone.Application.Common;

public interface ITokenService
{
    string GenerateToken(User user);
}
