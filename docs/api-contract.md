# Lapzy — Contrato de API

## Decisões de Design

### IDs gerados pelo cliente
O app opera offline-first. IDs são UUID v4 gerados localmente antes de qualquer sync.
- A API aceita o `id` do body (upsert por ID)
- Retorna 409 Conflict se o ID já existir para outro usuário
- Nunca gera novo ID no servidor

### `sectors` com elementos nulos
Array que pode conter `null`: setor não definido no momento da volta.
A API aceita e retorna `null` como valor válido em qualquer posição. É intencional.

### `trackName` desnormalizado
`RaceSessionRecord.trackName` repete o nome do traçado intencionalmente.
Garante legibilidade histórica após deleção do traçado. Não rejeitar como redundante.

### Timestamps
Formato: `YYYY-MM-DDTHH:mm:ssZ`. Sempre UTC. Sem timezone offset local.

### Sincronização offline-first
- `Track`: last-write-wins por `updatedAt`
- `RaceSession`: append-only por `id` (não editável, só criada ou deletada)
- `createdAt` é imutável após criação — nunca atualizado pelo servidor

### `LapResult` como valor embutido
Não tem ID próprio. Sempre parte de `RaceSessionRecord`.
A API não expõe `/laps` como endpoint independente.

### Ordenação padrão
- `GET /api/app/tracks` → `updatedAt DESC`
- `GET /api/app/sessions` → `date DESC`
- `laps[]` dentro de RaceSessionRecord → ordem cronológica (índice 0 = primeira volta)

## Endpoints

### App Flutter — `/api/app/*`

#### Tracks
| Método | Endpoint | Status |
|---|---|---|
| GET | /api/app/tracks | 200 Track[] |
| GET | /api/app/tracks/:id | 200 Track |
| POST | /api/app/tracks | 201 Track |
| PUT | /api/app/tracks/:id | 200 Track |
| DELETE | /api/app/tracks/:id | 204 |

#### Sessions
| Método | Endpoint | Status |
|---|---|---|
| GET | /api/app/sessions | 200 RaceSessionRecord[] |
| GET | /api/app/sessions/:id | 200 RaceSessionRecord |
| GET | /api/app/sessions?trackId=:id | 200 RaceSessionRecord[] |
| POST | /api/app/sessions | 201 RaceSessionRecord |
| DELETE | /api/app/sessions/:id | 204 |

### Painel Web — `/api/web/*`
A definir conforme features do dashboard forem especificadas.
