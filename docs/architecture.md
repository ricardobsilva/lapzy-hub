# Lapzy Web — Arquitetura

## Diagrama de camadas

```
route.ts → controller → service → repository → Prisma → PostgreSQL
  ↑             ↑           ↑           ↑
HTTP          HTTP       Negócio      Banco
entry        format       pura        pura
```

## Responsabilidades por camada

**route.ts**
- Entrada HTTP exclusivamente
- Nenhuma lógica — delega imediatamente para o controller
- Exporta apenas GET, POST, PUT, DELETE

**controller**
- Valida input com Zod
- Monta Request/Response
- Chama service e retorna Response.json()
- Sem acesso direto ao Prisma

**service**
- Regra de negócio pura
- Sem Request, sem Response, sem Prisma
- Testável com mocks de repository
- Lança erros semânticos (nunca status HTTP)

**repository**
- Único ponto de acesso ao Prisma
- Sem regra de negócio
- Métodos nomeados por intenção: findByUser, create, updateLastSession

**lib/prisma.ts**
- Singleton único
- Nenhum outro arquivo instancia PrismaClient diretamente

## Separação app vs web

```
/api/app/*  — endpoints para o app Flutter
/api/web/*  — endpoints para o painel web (NextAuth session cookie)
```

## Fluxo completo — exemplo POST /api/app/sessions

1. route.ts recebe POST, chama SessionsAppController.create(request)
2. controller valida body com Zod (RaceSessionRecordSchema)
3. controller chama SessionService.createSession(validatedData, userId)
4. service aplica regras (ex: sessão sem voltas, conflito de ID)
5. service chama SessionRepository.create(data)
6. repository executa prisma.raceSession.create(...)
7. repository retorna o registro criado
8. service retorna para controller
9. controller retorna Response.json(session, { status: 201 })
