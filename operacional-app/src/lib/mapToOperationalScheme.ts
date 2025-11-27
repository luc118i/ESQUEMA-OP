// src/lib/mapToOperationalScheme.ts
import type {
  OperationalScheme,
  RoutePoint,
  InitialPoint,
} from "@/types/scheme";

import { timeStringToMinutes, minutesToTime } from "./timeUtils";

export function mapToOperationalScheme(
  scheme: any,
  points: any[] = [],
  summary?: any
): OperationalScheme {
  if (!scheme) {
    throw new Error("mapToOperationalScheme: esquema inválido");
  }

  // 🔹 Pegamos código e nome da linha
  const lineCode = scheme.codigo ?? "";
  const lineName = scheme.nome ?? "";

  // 🔹 Origem e destino extraídos do nome
  let origin = "";
  let destination = "";

  if (typeof lineName === "string" && lineName.includes("→")) {
    const [o, d] = lineName.split("→").map((s: string) => s.trim());
    origin = o;
    destination = d;
  }

  // 🔹 UF de origem/destino caso venha no esquema
  const origemLocation = scheme.origem_location || null;
  const destinoLocation = scheme.destino_location || null;

  const originState = origemLocation?.uf ?? "";
  const destinationState = destinoLocation?.uf ?? "";

  // 🔹 Monta initialPoint (ponto zero)
  let initialPoint: InitialPoint | undefined;

  if (origemLocation) {
    initialPoint = {
      name: origemLocation.descricao,
      city: origemLocation.cidade,
      state: origemLocation.uf,
      lat: Number(origemLocation.lat),
      lng: Number(origemLocation.lng),
    };
  }

  // 🔹 Ordena pontos por ordem
  const ordered = [...points].sort(
    (a, b) => Number(a.ordem ?? 0) - Number(b.ordem ?? 0)
  );

  // 🔹 Cálculo de horários
  const startMinutes = timeStringToMinutes(scheme.trip_time ?? "00:00");
  let currentMinutes = startMinutes;
  let cumulativeDistanceKm = 0;

  const routePoints: RoutePoint[] = ordered.map((p: any) => {
    const loc = p.location ?? null;

    const distance = Number(p.distancia_km ?? 0);
    const drive = Number(p.tempo_deslocamento_min ?? 0);
    const stop = Number(p.tempo_no_local_min ?? 0);

    // chegada e saída
    const arrival = currentMinutes + drive;
    const departure = arrival + stop;

    currentMinutes = departure;
    cumulativeDistanceKm += distance;

    return {
      id: p.id,
      order: p.ordem,
      type: p.tipo,

      distanceKm: distance,
      cumulativeDistanceKm,
      driveTimeMin: drive,
      stopTimeMin: stop,

      arrivalTime: minutesToTime(arrival),
      departureTime: minutesToTime(departure),

      location: loc
        ? {
            id: loc.id,
            name: loc.descricao,
            city: loc.cidade,
            state: loc.uf,
            shortName: loc.sigla,
            kind: loc.tipo,
            lat: Number(loc.lat),
            lng: Number(loc.lng),
          }
        : null,
    };
  });

  // ---------- Resumo ----------
  const totalKm = summary?.totalKm ?? cumulativeDistanceKm;
  const totalStops = summary?.totalStops ?? routePoints.length;
  const totalExpectedStops = summary?.expectedStops?.value ?? undefined;

  const totalTravelMinutes =
    summary?.totalTravelMinutes ??
    routePoints.reduce((s, p) => s + p.driveTimeMin, 0);
  const totalStopMinutes =
    summary?.totalStopMinutes ??
    routePoints.reduce((s, p) => s + p.stopTimeMin, 0);

  const totalDurationMinutes = totalTravelMinutes + totalStopMinutes;

  const averageSpeedKmH =
    summary?.averageSpeedKmH ??
    (totalTravelMinutes > 0
      ? Number((totalKm / (totalTravelMinutes / 60)).toFixed(1))
      : 0);

  return {
    id: scheme.id,

    lineCode,
    lineName,
    direction: scheme.direction ?? "Ida",

    origin,
    originState,
    destination,
    destinationState,

    tripTime: scheme.trip_time ?? "",

    initialPoint,
    routePoints,

    totalKm,
    totalStops,
    totalExpectedStops,

    totalTravelMinutes,
    totalStopMinutes,
    totalDurationMinutes,
    averageSpeedKmH,

    travelTime: minutesToTime(totalTravelMinutes),
    totalStopTime: minutesToTime(totalStopMinutes),

    rulesStatus: summary?.rulesStatus ?? undefined,

    createdAt: scheme.created_at,
    updatedAt: scheme.updated_at,
  };
}
