// Contrato de API — derivado do data_structures.md do app Lapzy

export interface GeoPoint {
  lat: number
  lng: number
}

export interface TrackLine {
  a: GeoPoint
  b: GeoPoint
  middlePoints: GeoPoint[]
  widthMeters: number // range: 3–30, default: 6
}

export interface Track {
  id: string                 // UUID v4 gerado pelo cliente
  name: string
  startFinishLine: TrackLine | null
  sectorBoundaries: TrackLine[]
  lastSession: string | null // ISO 8601 UTC
  createdAt: string          // ISO 8601 UTC
  updatedAt: string          // ISO 8601 UTC
}

export interface LapResult {
  lapMs: number
  sectors: (number | null)[] // null = setor não definido no momento da volta
}

export interface RaceSessionRecord {
  id: string                 // UUID v4 gerado pelo cliente
  trackId: string
  trackName: string          // desnormalizado — nunca remover
  date: string               // ISO 8601 UTC — início da corrida
  laps: LapResult[]          // ordem cronológica, índice 0 = primeira volta
  bestLapMs: number | null   // null se nenhuma volta completada
  createdAt: string          // ISO 8601 UTC — imutável após criação
}

export interface ApiError {
  error: string
  code?: string
}
