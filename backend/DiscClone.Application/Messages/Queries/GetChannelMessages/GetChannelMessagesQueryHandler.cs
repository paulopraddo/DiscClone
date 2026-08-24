using DiscClone.Domain.Channels;
using DiscClone.Domain.Messages;
using DiscClone.Domain.Servers;
using DiscClone.Domain.Users;
using FluentResults;
using MediatR;

namespace DiscClone.Application.Messages.Queries.GetChannelMessages;

public sealed class GetChannelMessagesQueryHandler(
    IChannelRepository channelRepository,
    IServerMemberRepository serverMemberRepository,
    IMessageRepository messageRepository,
    IUserRepository userRepository)
    : IRequestHandler<GetChannelMessagesQuery, Result<IReadOnlyList<MessageSummary>>>
{
    private const int HistoryLimit = 50;

    public async Task<Result<IReadOnlyList<MessageSummary>>> Handle(
        GetChannelMessagesQuery request, CancellationToken cancellationToken)
    {
        var channel = await channelRepository.GetByIdAsync(request.ChannelId, cancellationToken);

        if (channel is null)
        {
            return Result.Fail<IReadOnlyList<MessageSummary>>("Canal não encontrado.");
        }

        var isMember = await serverMemberRepository.ExistsAsync(channel.ServerId, request.UserId, cancellationToken);

        if (!isMember)
        {
            return Result.Fail<IReadOnlyList<MessageSummary>>("Você não tem acesso a este canal.");
        }

        var messages = await messageRepository.GetByChannelAsync(request.ChannelId, HistoryLimit, cancellationToken);

        var authorIds = messages.Select(m => m.AuthorId).Distinct().ToList();
        var authors = await userRepository.GetByIdsAsync(authorIds, cancellationToken);
        var usernameByAuthorId = authors.ToDictionary(u => u.Id, u => u.Username.Value);

        var summaries = messages
            .Select(m => new MessageSummary(
                m.Id,
                m.AuthorId,
                usernameByAuthorId.GetValueOrDefault(m.AuthorId, "Usuário removido"),
                m.Content.Value,
                m.CreatedAt))
            .ToList();

        return Result.Ok<IReadOnlyList<MessageSummary>>(summaries);
    }
}
