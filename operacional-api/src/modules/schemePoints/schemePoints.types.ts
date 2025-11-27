// src/modules/schemePoints/schemePoints.types.ts

export interface SchemePoint {
  id: string;
  scheme_id: string;
  location_id: string;
  ordem: number;
  tipo: string; // 'PD' | 'PA' | 'TM' | 'PE' etc.
  distancia_km: number;
  tempo_deslocamento_min: number;
  tempo_no_local_min: number;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateSchemePointInput {
  scheme_id: string;
  location_id: string;
  ordem: number;
  tipo: string;
  distancia_km: number;
  tempo_deslocamento_min: number;
  tempo_no_local_min: number;
}

export interface UpdateSchemePointInput {
  scheme_id?: string;
  location_id?: string;
  ordem?: number;
  tipo?: string;
  distancia_km?: number;
  tempo_deslocamento_min?: number;
  tempo_no_local_min?: number;
}
