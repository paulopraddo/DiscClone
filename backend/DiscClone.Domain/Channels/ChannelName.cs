using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Channels;

public sealed class ChannelName : ValueObject
{
    public const int MinLength = 2;
    public const int MaxLength = 100;

    public string Value { get; }

    private ChannelName(string value)
    {
        Value = value;
    }

    public static Result<ChannelName> Create(string value)
    {
        value = value?.Trim() ?? string.Empty;

        if (value.Length is < MinLength or > MaxLength)
        {
            return Result.Fail($"O nome do canal deve ter entre {MinLength} e {MaxLength} caracteres.");
        }

        return Result.Ok(new ChannelName(value));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
