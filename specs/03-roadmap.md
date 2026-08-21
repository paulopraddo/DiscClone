# Roadmap de Desenvolvimento

## Fase 1: Fundação do Backend (Clean Arch + DDD)
- [ ] Criar a solução .NET com a estrutura de pastas (Domain, Application, Infrastructure, API).
- [ ] Configurar o projeto `Domain` com as entidades centrais (User, Server, Channel, Message) e Value Objects.
- [ ] Configurar o projeto `Infrastructure` com Entity Framework Core e mapeamento para **PostgreSQL**.
- [ ] Configurar o pacote **Fluent Results** para o retorno dos casos de uso.

## Fase 2: Regras de Negócio e SignalR
- [ ] Implementar os casos de uso para criação de usuários, servidores e canais.
- [ ] Criar o SignalR Hub para gerenciar conexões e salas de chat.
- [ ] Integrar o salvamento de mensagens via EF Core dentro do fluxo do SignalR.

## Fase 3: Frontend (React)
- [ ] Configurar o projeto React com Vite e roteamento básico.
- [ ] Criar a interface visual inspirada no Discord (sidebar de servidores, canais e área de chat).
- [ ] Conectar o frontend ao backend utilizando o cliente SignalR (`@microsoft/signalr`).

## Fase 4: Compartilhamento de Tela
- [ ] Integrar o PeerJS no projeto React.
- [ ] Implementar a lógica de captura de tela (`getDisplayMedia`) e sinalização via SignalR.
- [ ] Testar a conexão P2P entre amigos.