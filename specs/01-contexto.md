# Contexto do Projeto: Clone do Discord

## Visão Geral
Aplicação de chat em tempo real e compartilhamento de tela inspirada no Discord, desenvolvida para uso próprio e para servir como base de estudos avançados de arquitetura de software e boas práticas de desenvolvimento.

## Stack Tecnológica

### Backend
* **Linguagem/Framework:** .NET (C#), ASP.NET Core
* **Banco de Dados:** PostgreSQL
* **ORM:** Entity Framework Core (EF Core)
* **Tratamento de Resultados/Erros:** Fluent Results
* **Padrão de Aplicação:** CQRS com MediatR (Commands/Queries e Handlers)
* **Comunicação em Tempo Real:** SignalR

### Frontend
* **Framework:** React (com Vite)
* **Comunicação Real-time:** `@microsoft/signalr`
* **Compartilhamento de Tela (P2P):** PeerJS (WebRTC)

## Princípios e Padrões de Projeto
* **Arquitetura:** Clean Architecture (Separação estrita de camadas: Domain, Application, Infrastructure, Presentation/API).
* **Design Patterns:** Domain-Driven Design (DDD) na camada de domínio.
* **Qualidade de Código:** SOLID e Clean Code rigorosamente aplicados.