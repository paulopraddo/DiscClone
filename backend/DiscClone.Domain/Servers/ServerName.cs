using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Servers;

public sealed class ServerName : ValueObject
{
    public const int MinLength = 2;
    public const int MaxLength = 100;

    public string Value { get; }

    private ServerName(string value)
    {
        Value = value;
    }

    public static Result<ServerName> Create(string value)
    {
        value = value?.Trim() ?? string.Empty;

        if (value.Length is < MinLength or > MaxLength)
        {
            return Result.Fail($"O nome do servidor deve ter entre {MinLength} e {MaxLength} caracteres.");
        }

        return Result.Ok(new ServerName(value));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
