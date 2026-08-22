# Arquitetura e Fluxo de Dados

## Clean Architecture & DDD

A solução .NET está dividida nos seguintes projetos/camadas:

1. **`Domain` (O coração do sistema):**
   * Contém as Entidades de Domínio, Value Objects, Domain Events e interfaces de repositório.
   * Totalmente isolada de frameworks externos (sem dependência do EF Core ou ASP.NET Core).

2. **`Application` (Regras de negócio):**
   * Segue o padrão **CQRS** com **MediatR**: cada caso de uso é um `Command` ou `Query` (`IRequest<T>`) com seu respectivo `Handler` (`IRequestHandler<TRequest, TResponse>`), organizados por feature (ex: `Users/Commands/CreateUser`).
   * Utiliza a biblioteca **Fluent Results** (`Result<T>`) como tipo de retorno dos Handlers, para padronizar sucessos e falhas de negócio, evitando exceções para fluxo de controle.

3. **`Infrastructure` (Persistência e Integrações):**
   * Configuração do EF Core com **PostgreSQL**.
   * Implementação dos repositórios e mapeamentos de banco de dados.
   * Implementação dos Hubs do **SignalR**.
   * Implementação da autenticação: hash de senha (PBKDF2) e emissão de tokens **JWT**.

4. **`API` (Apresentação):**
   * Endpoints HTTP (Minimal APIs ou Controllers) e configuração da injeção de dependência.

---

## Autenticação

* Senhas nunca são armazenadas em texto puro: são derivadas com **PBKDF2-SHA256** (100.000 iterações, salt aleatório por usuário) antes de persistir.
* No registro (`POST /api/auth/register`) e no login (`POST /api/auth/login`), o backend responde com um **JWT** (`userId`, `username`, `token`), que o frontend guarda e usa em todas as chamadas subsequentes.
* O SignalR Hub exige autenticação (`[Authorize]`). Como conexões WebSocket não enviam o header `Authorization`, o token é passado via query string (`?access_token=...`) e validado no evento `OnMessageReceived` do JWT Bearer.
* O `ChatHub` nunca confia em um `authorId` enviado pelo cliente: ele lê o id do usuário a partir das claims do token validado (`Context.User`), evitando que um cliente malicioso envie mensagens ou eventos em nome de outro usuário.

---

## Fluxo de Comunicação

### 1. Chat de Texto (Tempo Real via SignalR)
* O cliente React envia uma mensagem para o SignalR Hub no backend.
* O Hub aciona o Caso de Uso na camada de Application.
* A camada de Application valida as regras de negócio, utiliza o EF Core para salvar no PostgreSQL e retorna um `Result`.
* Se bem-sucedido, o SignalR despacha a mensagem instantaneamente para todos os clientes conectados na mesma sala/servidor.

### 2. Compartilhamento de Tela (P2P via PeerJS)
* O usuário clica em transmitir a tela.
* O frontend gera um ID de conexão local usando o PeerJS.
* Esse ID é enviado ao backend via SignalR, que difunde o aviso para os demais usuários da sala.
* Os outros navegadores conectam-se diretamente (Peer-to-Peer) ao ID do transmissor, economizando banda e recursos do servidor.