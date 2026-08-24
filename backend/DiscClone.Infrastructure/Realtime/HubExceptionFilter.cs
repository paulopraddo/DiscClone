using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace DiscClone.Infrastructure.Realtime;

/// <summary>
/// Evita que uma exceção inesperada num método do hub derrube a conexão do cliente sem
/// explicação — loga o erro e devolve uma <see cref="HubException"/> com mensagem amigável.
/// </summary>
public sealed class HubExceptionFilter(ILogger<HubExceptionFilter> logger) : IHubFilter
{
    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext, Func<HubInvocationContext, ValueTask<object?>> next)
    {
        try
        {
            return await next(invocationContext);
        }
        catch (HubException)
        {
            // Já é uma mensagem amigável destinada ao cliente (ex.: falta de acesso ao canal).
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Erro não tratado no método {HubMethod} do hub (conexão {ConnectionId})",
                invocationContext.HubMethodName,
                invocationContext.Context.ConnectionId);

            throw new HubException("Ocorreu um erro inesperado. Tente novamente.");
        }
    }
}
