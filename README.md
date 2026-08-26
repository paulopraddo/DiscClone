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

## Deploy

- **Backend**: `backend/Dockerfile` builda e roda a API; aplica migrations pendentes automaticamente ao iniciar. Pensado para plataformas como Railway/Fly/Render (lê a porta de `PORT` e confia em cabeçalhos `X-Forwarded-*` de proxy reverso).
- **Frontend**: `frontend/vercel.json` configura o deploy estático na Vercel.

## CI

Workflow em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) builda e testa backend e frontend em cada push/PR para `main`.
