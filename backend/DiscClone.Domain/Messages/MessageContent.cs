using DiscClone.Domain.Common;
using FluentResults;

namespace DiscClone.Domain.Messages;

public sealed class MessageContent : ValueObject
{
    public const int MaxLength = 4000;

    public string Value { get; }

    private MessageContent(string value)
    {
        Value = value;
    }

    public static Result<MessageContent> Create(string value)
    {
        value = value?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(value))
        {
            return Result.Fail("A mensagem não pode estar vazia.");
        }

        if (value.Length > MaxLength)
        {
            return Result.Fail($"A mensagem não pode ter mais de {MaxLength} caracteres.");
        }

        return Result.Ok(new MessageContent(value));
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
