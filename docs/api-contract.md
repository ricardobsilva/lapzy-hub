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

### `gpsDevice` opcional para compatibilidade retroativa
`RaceSessionRecord.gpsDevice` é `null` em sessões salvas antes da TASK-023.
A API aceita e retorna `null` sem erro. O hub nunca exige o campo para salvar uma sessão.

### `shareCode` gerado pelo servidor
`Track.shareCode` é sempre gerado pelo servidor (nunca pelo cliente) via `POST /api/app/tracks/:id/share`.
O cliente nunca envia `shareCode` em `POST /api/app/tracks` — campo ignorado se presente.
`shareCode`: 6 caracteres `[A-Z0-9]`, único globalmente, expira em 30 dias a partir da geração.

### Traçado compartilhado não expõe sessões
`GET /api/app/tracks/shared/:shareCode` retorna apenas a geometria do traçado (campos de `Track` exceto `userId`).
Nenhuma `RaceSessionRecord` do criador é exposta — nem IDs, nem tempos.

## Endpoints

### App Flutter — `/api/app/*`

#### Tracks
| Método | Endpoint | Status | Descrição |
|---|---|---|---|
| GET | /api/app/tracks | 200 Track[] | Lista traçados do usuário autenticado |
| GET | /api/app/tracks/:id | 200 Track | Busca traçado por ID |
| POST | /api/app/tracks | 201 Track | Cria traçado (ID gerado pelo cliente) |
| PUT | /api/app/tracks/:id | 200 Track | Atualiza traçado existente |
| DELETE | /api/app/tracks/:id | 204 | Remove traçado |
| POST | /api/app/tracks/:id/share | 200 `{ shareCode }` | Gera ou renova código de compartilhamento |

#### Tracks — Compartilhamento (sem autenticação de dono)
| Método | Endpoint | Status | Descrição |
|---|---|---|---|
| GET | /api/app/tracks/shared/:shareCode | 200 SharedTrack | Retorna geometria do traçado pelo código. Requer token de app válido, mas não autenticação do criador. Retorna 404 se código inválido ou expirado. |

`SharedTrack` é um subconjunto de `Track` sem `userId`:
```json
{
  "id": "uuid-do-traçado-original",
  "name": "Granja Viana",
  "startFinishLine": { ... },
  "sectorBoundaries": [ ... ],
  "createdAt": "2026-05-10T10:00:00Z"
}
```
O app importa criando um novo `Track` local com UUID próprio e `importedFrom = shareCode`.

#### Sessions
| Método | Endpoint | Status | Descrição |
|---|---|---|---|
| GET | /api/app/sessions | 200 RaceSessionRecord[] | Lista sessões do usuário autenticado |
| GET | /api/app/sessions/:id | 200 RaceSessionRecord | Busca sessão por ID |
| GET | /api/app/sessions?trackId=:id | 200 RaceSessionRecord[] | Lista sessões por traçado |
| POST | /api/app/sessions | 201 RaceSessionRecord | Salva sessão (ID gerado pelo cliente) |
| DELETE | /api/app/sessions/:id | 204 | Remove sessão |

### Painel Web — `/api/web/*`

#### Dashboard
| Método | Endpoint | Status | Descrição |
|---|---|---|---|
| GET | /api/web/dashboard | 200 DashboardSummary | Métricas agregadas do usuário autenticado |

`DashboardSummary` (a definir em detalhe na implementação):
```json
{
  "personalBest": { "trackId": "...", "trackName": "...", "lapMs": 54890 },
  "totalLaps": 412,
  "totalSeatTimeMs": 1432000,
  "favoriteTrack": { "trackId": "...", "trackName": "...", "sessionCount": 14 },
  "lastSession": { ... },
  "recentProgressByTrack": [ ... ]
}
```

## Schemas de payload (campos novos — TASK-023 e TASK-024)

### GpsDevice (novo — TASK-023)

Embutido em `RaceSessionRecord`. Nullable para compatibilidade retroativa.

```json
{
  "manufacturer": "Samsung",
  "model": "SM-A356B",
  "androidVersion": "14",
  "accuracyLabel": "GPS de smartphone · Precisão típica: ±300–500ms"
}
```

### RaceSessionRecord — campo adicionado

```json
{
  "id": "...",
  "trackId": "...",
  "trackName": "Granja Viana",
  "date": "2026-05-10T14:30:00Z",
  "laps": [ ... ],
  "bestLapMs": 54890,
  "createdAt": "2026-05-10T16:45:00Z",
  "gpsDevice": {
    "manufacturer": "Samsung",
    "model": "SM-A356B",
    "androidVersion": "14",
    "accuracyLabel": "GPS de smartphone · Precisão típica: ±300–500ms"
  }
}
```

### Track — campos adicionados (TASK-024)

```json
{
  "id": "uuid-gerado-pelo-cliente",
  "name": "Granja Viana",
  "startFinishLine": { ... },
  "sectorBoundaries": [ ... ],
  "lastSession": null,
  "createdAt": "2026-05-10T10:00:00Z",
  "updatedAt": "2026-05-10T10:00:00Z",
  "shareCode": null,
  "importedFrom": null
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `shareCode` | `string?` | Gerado pelo servidor via `POST /share`. Null se nunca compartilhado. Ignorado se enviado pelo cliente em POST/PUT. |
| `importedFrom` | `string?` | `shareCode` de origem, preenchido pelo app no momento da importação. Imutável após criação. |

### Resposta de `POST /api/app/tracks/:id/share`

```json
{
  "shareCode": "GV7K2M",
  "expiresAt": "2026-06-09T10:00:00Z"
}
```
