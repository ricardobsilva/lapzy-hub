# Lapzy Web — Estratégia de Testes

## Filosofia

Mesmas diretrizes do app Flutter, adaptadas para Node.js/TypeScript:
- Todo código novo deve ter testes antes de ser considerado Done
- Testes são completamente independentes — sem estado compartilhado global
- Nenhuma tarefa sai de "Em Progresso" sem todos os testes passando
- Cobertura obrigatória: services, repositories, controllers

## Tipos de teste

### Unitários — Services
- Testam regra de negócio pura
- Repositories mockados com vi.mock()
- Sem banco, sem HTTP
- Meta: < 5ms por teste
- Local: `__tests__/services/`

### Integração — Repositories
- Queries reais contra `lapzy_test` (porta 5433)
- Cada teste roda dentro de transaction revertida no teardown
- Banco nunca tem dados persistidos entre runs
- Local: `__tests__/repositories/`

### Integração leve — Controllers
- Testam contrato HTTP: status codes, shape do response, validação Zod
- Services mockados
- Local: `__tests__/controllers/`

## Padrão de isolamento em testes de repository

```typescript
import { prisma } from "@/lib/prisma"
import { beforeEach, afterEach } from "vitest"

beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`
})

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`
})
```

## Padrão de mock em testes de service

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest"
import { SessionRepository } from "@/repositories/session.repository"

vi.mock("@/repositories/session.repository")

beforeEach(() => {
  vi.clearAllMocks()
})
```

## Comandos

```bash
npm test                          # roda tudo com .env.test automático
npm run test:coverage             # com relatório de cobertura
npm test -- __tests__/services    # apenas unitários
npm run db:reset:test             # reseta banco de testes antes de rodar integração
```

## Regras absolutas

- Nunca usar banco de desenvolvimento para rodar testes
- Nunca compartilhar instância PrismaClient entre arquivos de teste
- Mocks de repository resetados com vi.clearAllMocks() no beforeEach
- Testes de service não importam nada de @prisma/client diretamente
- Testes de repository sempre usam transaction + rollback
