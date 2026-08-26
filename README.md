# DiscClone

Clone simplificado do Discord: servidores, canais de texto/voz, chat em tempo real via SignalR, chamadas de voz e compartilhamento de tela P2P via PeerJS.

- **Backend**: .NET 10, Clean Architecture + DDD, CQRS com MediatR, EF Core + PostgreSQL, SignalR, JWT.
- **Frontend**: React 19 + Vite + TypeScript.

Detalhes de arquitetura, autenticação e fluxo de dados estão em [`specs/`](specs/).

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (para o PostgreSQL local) ou uma instância PostgreSQL própria

## Rodando localmente

### 1. Banco de dados

```bash
docker compose up -d
```

Sobe um PostgreSQL em `localhost:5432` (db `discclone`, usuário/senha `postgres`).

### 2. Backend

```bash
cd backend
dotnet run --project DiscClone.API
```

A API sobe em `http://localhost:5225` (porta definida em `Properties/launchSettings.json`). As migrations do EF Core são aplicadas automaticamente ao iniciar.

Configure os segredos abaixo antes de rodar (veja [Variáveis de ambiente](#variáveis-de-ambiente-backend)). Para desenvolvimento local, `appsettings.Development.json` já traz um segredo JWT de exemplo — **não usar em produção**.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` e usa `VITE_API_URL` para apontar para o backend (já configurado em `.env.development`).

## Testes

```bash
# Backend
cd backend
dotnet test DiscClone.slnx

# Frontend
cd frontend
npm run test        # roda uma vez
npm run test:watch  # modo watch
npm run test:coverage
```

Lint do frontend: `npm run lint` (oxlint).

## Variáveis de ambiente (backend)

Configuráveis via `appsettings.json` / `appsettings.Development.json` ou variáveis de ambiente (`ConnectionStrings__DiscClone`, `Jwt__Secret`, etc.).

| Chave | Descrição |
|---|---|
| `ConnectionStrings:DiscClone` | Connection string do PostgreSQL. |
| `Jwt:Issuer` / `Jwt:Audience` | Issuer/audience do token JWT. |
| `Jwt:Secret` | Chave simétrica usada para assinar os JWTs. **Trocar em produção.** |
| `Jwt:ExpirationMinutes` | Validade do token, em minutos. |
| `Cors:AllowedOrigins` | Lista de origens permitidas pelo CORS (URLs do frontend). |
| `Brevo:ApiKey` | API key da [Brevo](https://www.brevo.com/), usada para enviar e-mails de verificação de cadastro. |
| `Brevo:SenderEmail` / `Brevo:SenderName` | Remetente usado nos e-mails enviados. |
| `PORT` | Porta HTTP da API (usada por Railway/Fly/Render; opcional em dev). |

## Variáveis de ambiente (frontend)

| Chave | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API backend (HTTP e SignalR). |

## Rate limiting

A API limita requisições por IP: 100 req/min globalmente e 10 req/min nos endpoints de `/api/auth/*` (login, registro, verificação, reenvio de código), para dificultar força bruta. Excedendo o limite, a API responde `429 Too Many Requests`.

## Health check

`GET /health` verifica se a API está no ar e consegue se conectar ao PostgreSQL, retornando `200 Healthy` ou `503 Unhealthy`. Útil para probes de infraestrutura (Railway/Fly/Render, load balancers, etc).

## Deploy

- **Backend**: `backend/Dockerfile` builda e roda a API; aplica migrations pendentes automaticamente ao iniciar. Pensado para plataformas como Railway/Fly/Render (lê a porta de `PORT` e confia em cabeçalhos `X-Forwarded-*` de proxy reverso).
- **Frontend**: `frontend/vercel.json` configura o deploy estático na Vercel.

## CI

Workflow em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) builda e testa backend e frontend em cada push/PR para `main`.

## Limitações conhecidas (o que falta para produção real)

Este projeto é sólido como estudo/portfólio (Clean Architecture, DDD, testes, CI, SignalR, WebRTC funcionando de ponta a ponta), mas **não está pronto para produção com usuários pagantes** sem resolver os pontos abaixo.

**Bloqueadores de escala** — quebram ou degradam com mais de uma instância/uso real:
- `VoiceRoomRegistry` (estado das salas de voz) é um singleton em memória: não funciona com múltiplas instâncias do backend atrás de um load balancer. SignalR também precisaria de um backplane (ex.: Redis) para escalar horizontalmente.
- Voz/compartilhamento de tela via PeerJS é P2P mesh puro, sem servidor TURN. Falha atrás de NAT simétrico/firewall corporativo, e a qualidade cai rápido com mais de ~4 participantes numa call (cada peer envia mídia para todos os outros).
- JWT sem refresh token nem revogação: logout só limpa o token no cliente; o token continua válido no servidor até expirar (`Jwt:ExpirationMinutes`, hoje 24h). Não há como invalidar uma sessão comprometida.

**Segurança/confiabilidade antes de aceitar usuários reais:**
- Sem observabilidade: nenhum logging estruturado, métricas ou error tracking (ex.: Sentry, Application Insights).
- Sem lockout de conta após tentativas de login inválidas (só rate limit por IP, contornável).
- Segredos (`Jwt:Secret`, `Brevo:ApiKey`) vivem em `appsettings`/variáveis de ambiente simples; em produção deveriam estar num vault (Key Vault, secrets do provedor de deploy, etc).
- Sem exclusão de conta nem exportação de dados do usuário (relevante para LGPD/GDPR).

**Faltando para virar produto (não para funcionar, para vender):**
- Billing/assinatura (sem Stripe, planos ou limites por plano).
- Upload de arquivo/imagem no chat, avatar de usuário.
- Papéis além de dono/membro (moderador, permissões por canal).
- Notificações (badge de não lido, push).
