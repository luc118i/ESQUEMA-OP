// src/modules/schemes/schemes.types.ts
export interface Scheme {
  id: string;
  codigo: string;
  nome: string;
  origem_location_id: string;
  destino_location_id: string;
  distancia_total_km: number;
  ativo: boolean;
  created_at: string;
  updated_at?: string | null;
  trip_time?: string | null;
}

export type SchemeWithLocations = Scheme & {
  origem_location?: {
    id: string;
    cidade: string;
    uf: string;
    descricao: string | null;
    lat: number;
    lng: number;
  } | null;
  destino_location?: {
    id: string;
    cidade: string;
    uf: string;
    descricao: string | null;
    lat: number;
    lng: number;
  } | null;
};

export interface CreateSchemeInput {
  codigo: string;
  nome: string;
  origem_location_id: string;
  destino_location_id: string;
  distancia_total_km: number;
  ativo?: boolean;
}

export interface UpdateSchemeInput {
  codigo?: string;
  nome?: string;
  origem_location_id?: string;
  destino_location_id?: string;
  distancia_total_km?: number;
  ativo?: boolean;
}

export interface SchemeWithSummary {
  scheme: SchemeWithLocations;
  summary: SchemeSummary;
}

export interface SchemeSummary {
  schemeId: string;
  schemeCodigo: string;
  schemeNome: string;

  // Distância total do esquema
  totalKm: number;

  // TOTAL de registros na tabela scheme_points (PE, PD, PA, AP, etc)
  totalStops: number;

  // 🆕 Regras de negócio simplificadas:
  // - Paradas = totalStops
  // - Pontos  = totalStops - PD
  totalParadas: number; // = totalStops
  totalPontos: number; // = totalStops - (countsByType["PD"] ?? 0)

  // Paradas esperadas pela regra de 495 km (ponto de apoio)
  expectedStops: {
    value: number;
    totalKm: number;
    ruleKm: number;
  };

  // Tempos (minutos)
  totalTravelMinutes: number; // tempo rodando
  totalStopMinutes: number; // tempo parado
  totalDurationMinutes: number; // total (parado + rodando)
  averageSpeedKmH: number | null;

  // Quantidade por tipo (PE, PD, PA, AP, etc)
  countsByType: Record<string, number>;

  // Quantidade de trechos > 200 km
  longSegmentsCount: number;

  // Status geral das regras do esquema
  rulesStatus: {
    status: "OK" | "WARNING" | "ERROR";
    message: string;
  };
}
