# Roadmap de Desenvolvimento

## Fase 1: Fundação do Backend (Clean Arch + DDD)
- [x] Criar a solução .NET com a estrutura de pastas (Domain, Application, Infrastructure, API).
- [x] Configurar o projeto `Domain` com as entidades centrais (User, Server, Channel, Message) e Value Objects.
- [x] Configurar o projeto `Infrastructure` com Entity Framework Core e mapeamento para **PostgreSQL**.
- [x] Configurar o pacote **Fluent Results** para o retorno dos casos de uso.

## Fase 2: Regras de Negócio e SignalR
- [x] Implementar os casos de uso para criação de usuários, servidores e canais.
- [x] Criar o SignalR Hub para gerenciar conexões e salas de chat.
- [x] Integrar o salvamento de mensagens via EF Core dentro do fluxo do SignalR.

## Fase 3: Frontend (React)
- [x] Configurar o projeto React com Vite e roteamento básico.
- [x] Criar a interface visual inspirada no Discord (sidebar de servidores, canais e área de chat).
- [x] Conectar o frontend ao backend utilizando o cliente SignalR (`@microsoft/signalr`).

## Fase 4: Compartilhamento de Tela
- [x] Integrar o PeerJS no projeto React.
- [x] Implementar a lógica de captura de tela (`getDisplayMedia`) e sinalização via SignalR.
- [x] Testar a conexão P2P entre amigos.

## Fase 5: Comunicação de Voz
- [x] Adicionar captura de áudio do microfone e chamadas de voz P2P (PeerJS) nos canais de voz, com sinalização via SignalR (join/leave da sala).

## Fase 6: Autenticação de Usuários
- [x] Adicionar hash de senha (PBKDF2) e emissão de JWT no registro/login (`POST /api/auth/register`, `POST /api/auth/login`).
- [x] Proteger o SignalR Hub com `[Authorize]`, autenticando via token JWT na query string e usando o usuário autenticado (não o cliente) como origem de mensagens/eventos.
- [x] Criar telas de login/registro no frontend e proteger as rotas do app (`RequireAuth`).

## Fase 7: Servidores e Canais Reais
- [x] Expor `GET /api/servers`, `POST /api/servers` e `POST /api/servers/{id}/channels` (protegidos por JWT), substituindo os dados mock do frontend.
- [x] Adicionar o conceito de membro de servidor (`ServerMember`) e um fluxo de convite simples (`POST /api/servers/{id}/join`, usando o ID do servidor como convite), permitindo que outros usuários entrem em um servidor.
- [x] Corrigir falha de autorização: `SendMessage` e o `ChatHub` (`JoinChannel`/`JoinVoiceChannel`) agora verificam se o usuário é membro do servidor antes de aceitar mensagens ou permitir a entrada no canal.
- [x] UI para criar servidor/canal, entrar em um servidor por ID, e copiar o ID do servidor para convidar alguém.