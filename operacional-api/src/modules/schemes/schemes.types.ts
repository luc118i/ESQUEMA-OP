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

// src/modules/schemes/schemes.types.ts

export interface SchemeSummary {
  schemeId: string;
  schemeCodigo: string;
  schemeNome: string;

  totalKm: number;
  totalStops: number;

  // Paradas esperadas pela regra de 495 km (ponto de apoio)
  expectedStops: {
    value: number;
    totalKm: number;
    ruleKm: number;
  };

  totalTravelMinutes: number; // tempo de deslocamento
  totalStopMinutes: number; // tempo parado
  totalDurationMinutes: number; // total (deslocamento + paradas)
  averageSpeedKmH: number | null;

  countsByType: Record<string, number>;

  longSegmentsCount: number; // trechos > 200km
  rulesStatus: {
    status: "OK" | "WARNING" | "ERROR";
    message: string;
  };
}
