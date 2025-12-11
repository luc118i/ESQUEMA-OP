// src/services/schemes/saveScheme.ts

import type { RoutePoint } from "@/types/scheme";
import { API_URL } from "@/services/api";

export type Direction = "ida" | "volta";

export interface SchemeDraft {
  // se vier preenchido = edição, se undefined = criação
  schemeId?: string;

  // cabeçalho
  lineCode: string;
  lineName: string;

  // ids já existentes na tabela locations
  originLocationId: string;
  destinationLocationId: string;

  direction: Direction;
  tripTime: string; // "HH:MM"

  // rota montada na tela
  routePoints: RoutePoint[];
}

interface SaveSchemeResult {
  schemeId: string;
}

/**
 * Converte RoutePoint (do front) -> payload de scheme_points da API
 */
function mapRoutePointsToApiPayload(
  schemeId: string,
  routePoints: RoutePoint[]
) {
  return routePoints.map((point, index) => {
    // Se por algum motivo order não vier preenchido,
    // garantimos uma ordem sequencial (1, 2, 3...).
    const ordem =
      typeof point.order === "number" && Number.isFinite(point.order)
        ? point.order
        : index + 1;

    // Se você tiver o campo establishment no RoutePoint,
    // pode incluir no type para evitar esse cast extra.
    const p = point as RoutePoint & { establishment?: string };

    return {
      scheme_id: schemeId,

      // Ordem do ponto na rota
      ordem,

      // Sempre usa o id da location (modelo atual)
      location_id: point.location.id,

      // Tipo de ponto (PE, PP, PD, PA, TMJ, PL, etc.)
      tipo: point.type,

      // Distâncias e tempos diretamente do modelo atual
      distancia_km: point.distanceKm,
      distancia_acumulada_km: point.cumulativeDistanceKm,
      tempo_deslocamento_min: point.driveTimeMin,
      tempo_no_local_min: point.stopTimeMin,

      velocidade_media_kmh: point.avgSpeed ?? null,

      // Flags de início/fim da rota
      is_initial: !!point.isInitial,
      is_final: index === routePoints.length - 1,

      // Campos textuais
      estabelecimento: p.establishment ?? null,
      justificativa: point.justification ?? null,
    };
  });
}

/**
 * Calcula distância total a partir dos pontos
 */
function computeTotalDistanceKm(routePoints: RoutePoint[]): number {
  if (!routePoints.length) return 0;

  const last = routePoints[routePoints.length - 1] as any;

  // 1) Preferir o acumulado novo
  if (typeof last.cumulativeDistanceKm === "number") {
    return last.cumulativeDistanceKm;
  }

  // 2) Compatibilidade: se um dia vier accumulatedDistance antigo
  if (typeof last.accumulatedDistance === "number") {
    return last.accumulatedDistance;
  }

  // 3) Fallback: somar as distâncias ponto a ponto
  return routePoints.reduce((sum, p) => {
    const d =
      (p as any).distanceKm ?? // novo
      (p as any).distance ?? // legado
      (p as any).distancia_km ?? // legado
      0;

    return sum + (typeof d === "number" ? d : 0);
  }, 0);
}

/**
 * Service principal: cria ou atualiza esquema + pontos
 */
export async function saveScheme(
  draft: SchemeDraft
): Promise<SaveSchemeResult> {
  // 🔎 validações mínimas (proteção extra além do que a tela já faz)
  if (!draft.lineCode) {
    throw new Error("Código da linha não informado.");
  }
  if (!draft.originLocationId || !draft.destinationLocationId) {
    throw new Error("IDs de origem e destino não informados.");
  }
  if (!draft.direction) {
    throw new Error("Sentido da viagem não informado.");
  }
  if (!draft.tripTime) {
    throw new Error("Horário da viagem não informado.");
  }
  if (!draft.routePoints.length) {
    throw new Error("Nenhum ponto de rota informado.");
  }

  const totalDistanceKm = computeTotalDistanceKm(draft.routePoints);

  // 1) Cria ou atualiza o esquema
  const schemePayload = {
    codigo: draft.lineCode,
    nome: draft.lineName,
    origem_location_id: draft.originLocationId,
    destino_location_id: draft.destinationLocationId,
    distancia_total_km: totalDistanceKm,
    direction: draft.direction,
    trip_time: draft.tripTime,
    ativo: true,
  };

  let schemeId = draft.schemeId;

  // criação
  if (!schemeId) {
    const res = await fetch(`${API_URL}/schemes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schemePayload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[saveScheme] erro ao criar scheme:", text);
      throw new Error("Erro ao criar esquema operacional.");
    }

    const created = await res.json();
    schemeId = created.id;
  } else {
    // atualização
    const res = await fetch(`${API_URL}/schemes/${schemeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schemePayload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[saveScheme] erro ao atualizar scheme:", text);
      throw new Error("Erro ao atualizar esquema operacional.");
    }
  }

  if (!schemeId) {
    throw new Error(
      "Esquema operacional não possui ID após criação/atualização."
    );
  }

  // 2) Monta payload dos pontos
  const pointsPayload = mapRoutePointsToApiPayload(schemeId, draft.routePoints);

  console.log(">> Enviando pointsPayload:", pointsPayload);

  // 3) Envia todos os pontos (substitui os existentes)
  const resPoints = await fetch(
    `${API_URL}/scheme-points/schemes/${schemeId}/points`,

    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pointsPayload),
    }
  );

  if (!resPoints.ok) {
    const text = await resPoints.text();
    console.error("[saveScheme] erro ao salvar pontos:", text);
    throw new Error("Erro ao salvar pontos do esquema operacional.");
  }

  // se quiser, aqui daria pra fazer um GET /schemes/:id/full e devolver tudo
  return { schemeId };
}

export async function findSchemeByKey(
  lineCode: string,
  direction: "ida" | "volta",
  tripTime: string
): Promise<{ id: string } | null> {
  const params = new URLSearchParams({
    codigo: lineCode,
    direction,
    tripTime,
  });

  const res = await fetch(`${API_URL}/schemes/search?${params.toString()}`);

  if (res.status === 404) {
    return null; // não existe esquema para essa combinação
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("[findSchemeByKey] resposta não OK:", res.status, text);
    throw new Error("Erro ao verificar existência do esquema.");
  }

  const data = await res.json();
  return { id: data.id };
}
