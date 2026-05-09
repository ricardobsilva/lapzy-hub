# Lapzy Web — Ambientes e Bancos de Dados

## Tabela de ambientes

| Ambiente    | NODE_ENV    | Arquivo .env           | Porta Postgres | Container Docker    |
|-------------|-------------|------------------------|----------------|---------------------|
| Dev local   | development | .env.development.local | 5432           | lapzy_db_dev        |
| Testes      | test        | .env.test              | 5433           | lapzy_db_test       |
| Staging     | staging     | .env.staging           | 5434           | lapzy_db_staging    |
| Produção    | production  | .env.production        | (externo)      | —                   |

## Você nunca precisa trocar DATABASE_URL manualmente

- `npm run dev` → NODE_ENV=development → carrega .env.development.local → banco 5432
- `npm test`    → NODE_ENV=test (Vitest automático) → carrega .env.test → banco 5433

## Inicialização do ambiente de desenvolvimento

```bash
# 1. Subir bancos
docker compose up db_dev db_test -d

# 2. Aplicar migrations no banco de desenvolvimento
npm run db:migrate

# 3. Aplicar migrations no banco de testes
npm run db:migrate:test

# 4. Subir aplicação
npm run dev
```

## Scripts relevantes no package.json

```json
{
  "scripts": {
    "dev":              "next dev",
    "build":            "next build",
    "start":            "next start",
    "test":             "vitest",
    "test:coverage":    "vitest run --coverage",
    "db:migrate":       "prisma migrate dev",
    "db:migrate:test":  "dotenv -e .env.test -- prisma migrate deploy",
    "db:reset:test":    "dotenv -e .env.test -- prisma migrate reset --force",
    "db:studio":        "prisma studio",
    "db:generate":      "prisma generate"
  }
}
```

## Comportamento das migrations por ambiente

| Comando | Ambiente | Comportamento |
|---|---|---|
| prisma migrate dev | development | Cria migration + aplica + regenera client |
| prisma migrate deploy | staging/prod | Aplica migrations existentes — nunca cria novas |
| prisma migrate reset | test | Dropa banco, recria do zero, aplica tudo |
