// src/modules/schemes/schemes.service.ts
import { supabase } from "../../config/upabaseClient";
import type {
  Scheme,
  CreateSchemeInput,
  UpdateSchemeInput,
  SchemeSummary,
  SchemeWithLocations,
} from "./schemes.types";

import type { SchemePoint } from "../schemePoints/schemePoints.types";

// src/modules/schemes/schemes.service.ts

export async function getAllSchemes(): Promise<SchemeWithLocations[]> {
  const { data, error } = await supabase
    .from("schemes")
    .select(
      `
      id,
      created_at,
      codigo,
      nome,
      trip_time,              
      distancia_total_km,
      ativo,
      updated_at,
      origem_location_id,
      destino_location_id,
      origem_location:origem_location_id (
        id,
        cidade,
        uf,
        descricao,
        lat,
        lng
      ),
      destino_location:destino_location_id (
        id,
        cidade,
        uf,
        descricao,
        lat,
        lng
      )
    `
    )
    .order("codigo", { ascending: true });

  if (error) {
    console.error("[getAllSchemes] erro:", error);
    throw new Error("Erro ao buscar esquemas operacionais");
  }

  const rows = (data ?? []) as any[];

  const schemes: SchemeWithLocations[] = rows.map((row) => ({
    id: row.id,
    created_at: row.created_at,
    codigo: row.codigo,
    nome: row.nome,
    trip_time: row.trip_time ?? null, // 👈 PASSA PRO TYPE
    distancia_total_km: row.distancia_total_km,
    ativo: row.ativo,
    updated_at: row.updated_at,
    origem_location_id: row.origem_location_id,
    destino_location_id: row.destino_location_id,
    origem_location: row.origem_location ?? null,
    destino_location: row.destino_location ?? null,
  }));

  return schemes;
}

export async function getSchemeById(
  id: string
): Promise<SchemeWithLocations | null> {
  const { data, error } = await supabase
    .from("schemes")
    .select(
      `
      id,
      created_at,
      codigo,
      nome,
      trip_time,
      distancia_total_km,
      ativo,
      updated_at,
      origem_location_id,
      destino_location_id,

      origem_location:origem_location_id (
        id,
        cidade,
        uf,
        descricao,
        lat,
        lng
      ),

      destino_location:destino_location_id (
        id,
        cidade,
        uf,
        descricao,
        lat,
        lng
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") return null;

    console.error("[getSchemeById] erro:", error);
    throw new Error("Erro ao buscar esquema operacional");
  }

  const row = data as any;

  return {
    id: row.id,
    created_at: row.created_at,
    codigo: row.codigo,
    nome: row.nome,
    trip_time: row.trip_time ?? null,
    distancia_total_km: row.distancia_total_km,
    ativo: row.ativo,
    updated_at: row.updated_at,
    origem_location_id: row.origem_location_id,
    destino_location_id: row.destino_location_id,

    origem_location: Array.isArray(row.origem_location)
      ? row.origem_location[0] ?? null
      : row.origem_location ?? null,

    destino_location: Array.isArray(row.destino_location)
      ? row.destino_location[0] ?? null
      : row.destino_location ?? null,
  };
}

export async function createScheme(input: CreateSchemeInput): Promise<Scheme> {
  const payload = {
    ...input,
    ativo: input.ativo ?? true,
  };

  const { data, error } = await supabase
    .from("schemes")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("[createScheme] erro:", error);
    throw new Error("Erro ao criar esquema operacional");
  }

  return data as Scheme;
}

export async function updateScheme(
  id: string,
  input: UpdateSchemeInput
): Promise<Scheme | null> {
  const { data, error } = await supabase
    .from("schemes")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") {
      return null;
    }

    console.error("[updateScheme] erro:", error);
    throw new Error("Erro ao atualizar esquema operacional");
  }

  return data as Scheme;
}

export async function deleteScheme(id: string): Promise<boolean> {
  const { error } = await supabase.from("schemes").delete().eq("id", id);

  if (error) {
    console.error("[deleteScheme] erro:", error);
    throw new Error("Erro ao excluir esquema operacional");
  }

  return true;
}

const RULE_SUPPORT_KM = 495; // ponto de apoio (ex.: 880 km / 495 = 2)
const LONG_SEGMENT_KM = 200; // alerta de trecho muito longo

export async function getSchemeSummary(
  schemeId: string
): Promise<SchemeSummary | null> {
  // 1) Buscar o esquema
  const { data: scheme, error: schemeError } = await supabase
    .from("schemes")
    .select("*")
    .eq("id", schemeId)
    .single();

  if (schemeError) {
    if ((schemeError as any).code === "PGRST116") {
      return null;
    }
    console.error("[getSchemeSummary] erro ao buscar scheme:", schemeError);
    throw new Error("Erro ao buscar esquema operacional");
  }

  // 2) Buscar os pontos do esquema
  const { data: points, error: pointsError } = await supabase
    .from("scheme_points")
    .select("*")
    .eq("scheme_id", schemeId)
    .order("ordem", { ascending: true });

  if (pointsError) {
    console.error(
      "[getSchemeSummary] erro ao buscar scheme_points:",
      pointsError
    );
    throw new Error("Erro ao buscar pontos do esquema operacional");
  }

  const schemePoints = (points ?? []) as SchemePoint[];

  // Se não tiver pontos, devolve um resumo "zerado"
  if (schemePoints.length === 0) {
    return {
      schemeId: scheme.id,
      schemeCodigo: (scheme as any).codigo ?? "",
      schemeNome: (scheme as any).nome ?? "",

      totalKm: 0,
      totalStops: 0,
      expectedStops: {
        value: 0,
        totalKm: 0,
        ruleKm: RULE_SUPPORT_KM,
      },
      totalTravelMinutes: 0,
      totalStopMinutes: 0,
      totalDurationMinutes: 0,
      averageSpeedKmH: null,
      countsByType: {},
      longSegmentsCount: 0,
      rulesStatus: {
        status: "OK",
        message: "Sem pontos cadastrados para este esquema",
      },
    };
  }

  // 3) Cálculos principais
  const totalKm = schemePoints.reduce(
    (sum, p) => sum + (p.distancia_km ?? 0),
    0
  );

  const totalTravelMinutes = schemePoints.reduce(
    (sum, p) => sum + (p.tempo_deslocamento_min ?? 0),
    0
  );

  const totalStopMinutes = schemePoints.reduce(
    (sum, p) => sum + (p.tempo_no_local_min ?? 0),
    0
  );

  const totalDurationMinutes = totalTravelMinutes + totalStopMinutes;

  const averageSpeedKmH =
    totalTravelMinutes > 0
      ? Number((totalKm / (totalTravelMinutes / 60)).toFixed(1))
      : null;

  // 4) Contar por tipo (PD, PA, TM, etc.)
  const countsByType: Record<string, number> = {};
  for (const p of schemePoints) {
    if (!p.tipo) continue;
    countsByType[p.tipo] = (countsByType[p.tipo] ?? 0) + 1;
  }

  const totalStops =
    (countsByType["PD"] ?? 0) +
    (countsByType["PA"] ?? 0) +
    (countsByType["PE"] ?? 0); // se quiser contar embarque também

  // 5) Paradas esperadas pela regra de 495 km (ponto de apoio)
  const expectedStopsValue =
    totalKm > 0 ? Math.ceil(totalKm / RULE_SUPPORT_KM) : 0;

  // 6) Trechos longos (> 200 km sem parada)
  const longSegments = schemePoints.filter(
    (p) => (p.distancia_km ?? 0) > LONG_SEGMENT_KM
  );
  const longSegmentsCount = longSegments.length;

  // 7) Status das regras (bem simplificado por enquanto)
  let rulesStatus: SchemeSummary["rulesStatus"] = {
    status: "OK",
    message: "Dentro das regras",
  };

  if (longSegmentsCount > 0) {
    rulesStatus = {
      status: "WARNING",
      message: `Dentro das regras com ${longSegmentsCount} aviso(s)`,
    };
  }

  // (no futuro dá pra acrescentar checagem de 330/495/660 km entre PD/PA/TM)

  return {
    schemeId: scheme.id,
    schemeCodigo: (scheme as any).codigo ?? "",
    schemeNome: (scheme as any).nome ?? "",

    totalKm,
    totalStops,
    expectedStops: {
      value: expectedStopsValue,
      totalKm,
      ruleKm: RULE_SUPPORT_KM,
    },
    totalTravelMinutes,
    totalStopMinutes,
    totalDurationMinutes,
    averageSpeedKmH,
    countsByType,
    longSegmentsCount,
    rulesStatus,
  };
}
