// src/pages/SchemeCreate/createSchemeHandlers.ts
import type { Dispatch, SetStateAction } from "react";
import type { RoutePoint } from "@/types/scheme";

import rawLines from "@/data/Lista-de-linhas.json";

// ===============================
// TIPAGEM DO CSV NORMALIZADA
// ===============================

type RawLine = (typeof rawLines)[number];

export type Line = {
  prefixo: string;
  nomeEmpresa: string;
  ufOrigem: string;
  municipioOrigem: string;
  instalacaoOrigem: string;
  ufDestino: string;
  municipioDestino: string;
  instalacaoDestino: string;
  prefixoSGP: string;
  situacao: string;
  quantidadeSecoes: number;
  ok: string;
};

// Normaliza o JSON (com nomes padronizados)
const lines: Line[] = (rawLines as RawLine[]).map((l) => ({
  prefixo: l["Prefixo"],
  nomeEmpresa: l["Nome Empresa"],
  ufOrigem: l["UF Origem"],
  municipioOrigem: l["Município Origem"],
  instalacaoOrigem: l["Instalação Origem"],
  ufDestino: l["UF Destino"],
  municipioDestino: l["Município Destino"],
  instalacaoDestino: l["Instalação Destino"],
  prefixoSGP: String(l["PrefixoSGP"] ?? ""),
  situacao: l["Situação"],
  quantidadeSecoes: Number(l["Quantidade de Seções"] ?? 0),
  ok: l["OK"],
}));

// Busca por códigos (prefixo ou prefixoSGP)
function findLineByCode(code: string): Line | undefined {
  const trimmed = code.trim().toUpperCase();

  return lines.find(
    (line) =>
      line.prefixo.toUpperCase() === trimmed ||
      line.prefixoSGP.toUpperCase() === trimmed
  );
}

type SelectedLine = Line | null;

// ===============================
// PARAMETROS ACEITOS PELOS HANDLERS
// ===============================

interface CreateSchemeHandlersParams {
  routePoints: RoutePoint[];
  setRoutePoints: Dispatch<SetStateAction<RoutePoint[]>>;

  selectedLine: SelectedLine;
  setSelectedLine: Dispatch<SetStateAction<SelectedLine>>;

  tripTime: string;
  setLineCode: Dispatch<SetStateAction<string>>;
  setIsModalOpen: (open: boolean) => void;
}

// ===============================
// FUNÇÃO PRINCIPAL QUE EXPORTA OS HANDLERS
// ===============================

export function createSchemeHandlers({
  routePoints,
  setRoutePoints,
  selectedLine,
  setSelectedLine,
  tripTime,
  setLineCode,
  setIsModalOpen,
}: CreateSchemeHandlersParams) {
  // =====================================
  // 1) ALTERAR LINHA
  // =====================================
  const handleLineCodeChange = (code: string) => {
    setLineCode(code);
    const line = findLineByCode(code);
    setSelectedLine(line ?? null);
  };

  // Define como ponto inicial sem mudar a ordem da lista
  // Recalcula horários para frente E para trás.
  // Pressupõe que `tripTime` (HH:mm) já esteja definido no escopo do handler.

  const handleSetInitialPoint = (pointId: string) => {
    if (!tripTime) return;

    // Helpers para converter horário <-> minutos
    const toMinutes = (time?: string | null): number | null => {
      if (!time) return null;
      const [h, m] = time.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };

    const toTimeString = (mins: number): string => {
      const total = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
      const h = Math.floor(total / 60);
      const m = total % 60;
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    };

    setRoutePoints((prev) => {
      if (!prev.length) return prev;

      const points = prev.map((p) => ({ ...p }));
      const initialIndex = points.findIndex((p) => p.id === pointId);
      if (initialIndex === -1) return prev;

      const startMinutes = toMinutes(tripTime);
      if (startMinutes === null) return prev;

      // 1) Ponto inicial: define saída e chegada
      const initialPoint = points[initialIndex];
      initialPoint.departureTime = tripTime;

      const stopInitial = initialPoint.stopTimeMin ?? 0;
      const initialArrivalMin = startMinutes - stopInitial;
      initialPoint.arrivalTime =
        initialArrivalMin >= 0 ? toTimeString(initialArrivalMin) : "";

      // IMPORTANTE: aqui consideramos que driveTimeMin e distanceKm
      // representam o trecho "do ponto ANTERIOR -> ponto ATUAL"
      // (valor armazenado no ponto de destino).

      // 2) Recalcula horários PARA FRENTE (pontos depois do inicial)
      for (let i = initialIndex + 1; i < points.length; i++) {
        const current = points[i];
        const prevPoint = points[i - 1];

        const prevDepartureMin = toMinutes(prevPoint.departureTime);
        if (prevDepartureMin === null) break;

        const driveTimeMin = current.driveTimeMin ?? 0; // trecho prev -> current
        const stopTimeCurrent = current.stopTimeMin ?? 0;

        const arrivalMin = prevDepartureMin + driveTimeMin;
        const departureMin = arrivalMin + stopTimeCurrent;

        current.arrivalTime = toTimeString(arrivalMin);
        current.departureTime = toTimeString(departureMin);
      }

      // 3) Recalcula horários PARA TRÁS (pontos antes do inicial)
      // Fórmulas usando o fato de que driveTimeMin está no ponto de destino:
      // arrival(i+1)      = departure(i+1) - stopTime(i+1)
      // departure(i)      = arrival(i+1)  - driveTime(i+1)
      // arrival(i)        = departure(i)  - stopTime(i)
      for (let i = initialIndex - 1; i >= 0; i--) {
        const current = points[i];
        const nextPoint = points[i + 1];

        const departureNextMin = toMinutes(nextPoint.departureTime);
        if (departureNextMin === null) break;

        const stopTimeNext = nextPoint.stopTimeMin ?? 0;
        const driveTimeMin = nextPoint.driveTimeMin ?? 0; // trecho current -> next
        const stopTimeCurrent = current.stopTimeMin ?? 0;

        const arrivalNextMin = departureNextMin - stopTimeNext;
        const departureCurrentMin = arrivalNextMin - driveTimeMin;
        const arrivalCurrentMin = departureCurrentMin - stopTimeCurrent;

        current.departureTime = toTimeString(departureCurrentMin);
        current.arrivalTime = toTimeString(arrivalCurrentMin);
      }

      return points;
    });
  };

  // =====================================
  // 2) ADICIONAR UM NOVO PONTO
  // =====================================
  const handleAddPoint = (pointInput: any) => {
    setRoutePoints((prev) => {
      // 1) Se já vier como RoutePoint completo, só adiciona
      if (
        pointInput &&
        typeof pointInput === "object" &&
        "id" in pointInput &&
        "order" in pointInput &&
        "location" in pointInput
      ) {
        const asRoutePoint = pointInput as RoutePoint;
        return [...prev, asRoutePoint];
      }

      // 2) Assume que veio do modal no formato:
      // {
      //   type,
      //   stopTimeMin,
      //   avgSpeed?,
      //   justification?,
      //   isRestStop?, ...
      //   location: { id, name, city, state, lat, lng, shortName?, kind? }
      // }
      const location = pointInput.location;

      const last = prev[prev.length - 1];
      const nextOrder = last ? last.order + 1 : 1;

      let distanceKm = 0;
      let cumulativeDistanceKm = 0;
      let driveTimeMin = 0;

      if (last) {
        distanceKm = calculateDistance(
          last.location.lat,
          last.location.lng,
          Number(location.lat),
          Number(location.lng)
        );

        cumulativeDistanceKm = last.cumulativeDistanceKm + distanceKm;

        const customSpeed =
          typeof pointInput.avgSpeed === "number"
            ? pointInput.avgSpeed
            : undefined;

        driveTimeMin = computeDriveTimeMinutes(distanceKm, customSpeed);
      } else {
        distanceKm = 0;
        cumulativeDistanceKm = 0;
        driveTimeMin = 0;
      }

      const stopTimeMin = Number(pointInput.stopTimeMin ?? 5);

      // calcula horários do novo ponto (se já existir horário no ponto anterior)
      let arrivalTime = "";
      let departureTime = "";

      if (last && last.departureTime && driveTimeMin > 0) {
        // Hr. Visita = saída do anterior + tempo de deslocamento
        arrivalTime = addMinutesToTime(last.departureTime, driveTimeMin);
        // Hora Saída = Hr. Visita + tempo no local
        departureTime = addMinutesToTime(arrivalTime, stopTimeMin);
      }

      const newPoint: RoutePoint = {
        id: String(location.id ?? crypto.randomUUID()),
        order: nextOrder,
        type: pointInput.type as RoutePoint["type"],
        stopTimeMin,

        distanceKm,
        cumulativeDistanceKm,
        driveTimeMin,
        arrivalTime,
        departureTime,

        location: {
          id: String(location.id),
          name: String(location.name ?? ""),
          city: String(location.city ?? ""),
          state: String(location.state ?? ""),
          shortName: String(location.shortName ?? location.name ?? ""),
          kind: String(location.kind ?? "OUTRO"),
          lat: Number(location.lat ?? 0),
          lng: Number(location.lng ?? 0),
        },

        avgSpeed:
          driveTimeMin > 0
            ? Number((distanceKm / (driveTimeMin / 60)).toFixed(1))
            : undefined,

        justification: pointInput.justification ?? "",

        // ---------------------------------------
        //  NOVAS FLAGS ANTT (aceita múltiplas)
        // ---------------------------------------
        isRestStop: !!pointInput.isRestStop, // Parada descanso / 330 km
        isSupportPoint: !!pointInput.isSupportPoint, // Ponto de apoio / 402–495 km
        isDriverChange: !!pointInput.isDriverChange, // Troca de motorista / 660 km
        isBoardingPoint: !!pointInput.isBoardingPoint, // Embarque
        isDropoffPoint: !!pointInput.isDropoffPoint, // Desembarque
        isFreeStop: !!pointInput.isFreeStop, // Parada livre / comercial
      };

      const next = [...prev, newPoint];
      return next;
    });
  };

  // =====================================
  // 3) ATUALIZAR UM PONTO EXISTENTE
  // =====================================
  const handleUpdatePoint = (id: string, updates: Partial<RoutePoint>) => {
    setRoutePoints((prevPoints) => {
      const pointIndex = prevPoints.findIndex((p) => p.id === id);
      if (pointIndex === -1) return prevPoints;

      const newPoints = [...prevPoints];
      const updatedPoint: RoutePoint = {
        ...newPoints[pointIndex],
        ...updates,
      };

      // só recalcula saída se não for o ponto inicial
      if (updates.stopTimeMin !== undefined && pointIndex > 0) {
        updatedPoint.departureTime = addMinutesToTime(
          updatedPoint.arrivalTime,
          updatedPoint.stopTimeMin
        );
      }

      newPoints[pointIndex] = updatedPoint;

      // recalcula os pontos seguintes
      for (let i = pointIndex + 1; i < newPoints.length; i++) {
        const prevPoint = newPoints[i - 1];
        const current = { ...newPoints[i] };

        current.arrivalTime = addMinutesToTime(
          prevPoint.departureTime,
          current.driveTimeMin
        );
        current.departureTime = addMinutesToTime(
          current.arrivalTime,
          current.stopTimeMin
        );

        newPoints[i] = current;
      }

      return newPoints;
    });
  };

  // =====================================
  // 4) DELETAR UM PONTO
  // =====================================
  const handleDeletePoint = (id: string) => {
    setRoutePoints((prevPoints) => {
      const newPoints = prevPoints.filter((p) => p.id !== id);

      for (let i = 0; i < newPoints.length; i++) {
        const current = { ...newPoints[i] };

        // 🔵 REGRAS ESPECIAIS PARA O PRIMEIRO PONTO
        if (i === 0) {
          newPoints[i] = {
            ...current,
            order: 1,
            distanceKm: 0,
            cumulativeDistanceKm: 0,
            driveTimeMin: 0,
            stopTimeMin: 0,
            arrivalTime: "",
            departureTime: tripTime || current.departureTime || "00:00",
          };
          continue;
        }

        // Demais pontos calculados normalmente
        const prevPoint = newPoints[i - 1];

        let distanceKm = 0;
        let cumulativeDistanceKm = 0;
        let driveTimeMin = 0;
        let arrivalTime = "";

        // distância do ponto anterior -> ponto atual
        distanceKm = calculateDistance(
          prevPoint.location.lat,
          prevPoint.location.lng,
          current.location.lat,
          current.location.lng
        );

        cumulativeDistanceKm = prevPoint.cumulativeDistanceKm + distanceKm;

        // usa a mesma regra da planilha + override da velocidade
        const customSpeed =
          typeof current.avgSpeed === "number" ? current.avgSpeed : undefined;

        driveTimeMin = computeDriveTimeMinutes(distanceKm, customSpeed);

        // chegada e saída recalculadas
        arrivalTime = addMinutesToTime(prevPoint.departureTime, driveTimeMin);
        const departureTime = addMinutesToTime(
          arrivalTime,
          current.stopTimeMin
        );

        newPoints[i] = {
          ...current,
          order: i + 1,
          distanceKm,
          cumulativeDistanceKm,
          driveTimeMin,
          arrivalTime,
          departureTime,
          avgSpeed:
            driveTimeMin > 0
              ? Number((distanceKm / (driveTimeMin / 60)).toFixed(1))
              : current.avgSpeed,
        };
      }

      return newPoints;
    });
  };

  return {
    handleLineCodeChange,
    handleAddPoint,
    handleUpdatePoint,
    handleDeletePoint,
    handleSetInitialPoint,
  };
}

// ===============================
// HELPERS LOCAIS
// ===============================

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Regra de tempo de deslocamento baseada na planilha
function computeDriveTimeMinutes(
  distanceKm: number,
  customSpeed?: number | null
): number {
  const FIXED_MINUTES = 30; // 30 min para casos especiais
  const SPEED_IN_RANGE = 70; // 10..100 km
  const SPEED_OUT_RANGE = 80; // fora dessa faixa

  // distância inválida ou negativa -> 30 min
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return FIXED_MINUTES;
  }

  // até 15 km -> sempre 30 min (regra fixa)
  if (distanceKm < 15) {
    return FIXED_MINUTES;
  }

  // se veio velocidade customizada do modal, respeita ela
  let speed: number | null = null;
  if (typeof customSpeed === "number" && customSpeed > 0) {
    speed = customSpeed;
  } else {
    // regra padrão da planilha
    speed =
      distanceKm >= 10 && distanceKm <= 100 ? SPEED_IN_RANGE : SPEED_OUT_RANGE;
  }

  const timeHours = distanceKm / speed;
  const minutes = Math.round(timeHours * 60);

  // failsafe: se algo der NaN/Infinity, cai para 30 min
  return Number.isFinite(minutes) && minutes > 0 ? minutes : FIXED_MINUTES;
}

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}

export function addMinutesToTime(time: string, minutes: number) {
  if (!time) return "";
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
