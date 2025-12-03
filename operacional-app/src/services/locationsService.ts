// src/services/locationsService.ts
import { api } from "@/services/api";

export interface LocationApi {
  id: string;
  sigla: string;
  descricao: string;
  cidade: string;
  uf: string;
  tipo: string;
  lat: number;
  lng: number;
  created_at?: string | null;
}

/**
 * Busca locais na API /locations?q=...
 * Retorna os registros exatamente no formato do backend (LocationApi).
 */
export async function searchLocationsApi(
  query: string
): Promise<LocationApi[]> {
  const trimmed = query.trim();

  // aqui, no front, se a busca estiver vazia, não faz chamada nenhuma
  if (!trimmed) {
    return [];
  }

  const response = await api.get<LocationApi[]>("/locations", {
    params: { q: trimmed },
  });

  return response.data ?? [];
}

export async function getLocationByIdApi(
  id: string
): Promise<LocationApi | null> {
  const response = await api.get<LocationApi | null>(`/locations/${id}`);
  return response.data;
}
