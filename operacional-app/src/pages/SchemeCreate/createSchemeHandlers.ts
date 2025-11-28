// src/pages/SchemeCreate/createSchemeHandlers.ts
import type { Dispatch, SetStateAction } from "react";
import type { RoutePoint } from "@/types/scheme";

// 🔹 Mock de linhas (fica fora do componente agora)
// quando você integrar com backend, pode remover isso daqui.
const mockLines = {
  DFG0053049: {
    code: "DFG0053049",
    name: "Linha Brasília - São Paulo",
    origin: "BRASÍLIA",
    destination: "SÃO PAULO",
    originState: "DF",
    destinationState: "SP",
    initialPoint: {
      name: "Garagem Brasília",
      city: "Brasília",
      state: "DF",
      lat: -15.7942,
      lng: -47.8822,
    },
  },
  SPG0021034: {
    code: "SPG0021034",
    name: "Linha São Paulo - Rio de Janeiro",
    origin: "SÃO PAULO",
    destination: "RIO DE JANEIRO",
    originState: "SP",
    destinationState: "RJ",
    initialPoint: {
      name: "Garagem São Paulo",
      city: "São Paulo",
      state: "SP",
      lat: -23.5505,
      lng: -46.6333,
    },
  },
};

type SelectedLine = (typeof mockLines)[keyof typeof mockLines] | null;

interface CreateSchemeHandlersParams {
  routePoints: RoutePoint[];
  setRoutePoints: Dispatch<SetStateAction<RoutePoint[]>>;

  selectedLine: SelectedLine;
  setSelectedLine: Dispatch<SetStateAction<SelectedLine>>;

  tripTime: string;
  setLineCode: Dispatch<SetStateAction<string>>;
  setIsModalOpen: (open: boolean) => void;
}

/**
 * Função que recebe os estados e devolve
 * os handlers já prontos pra usar no componente.
 */
export function createSchemeHandlers({
  routePoints,
  setRoutePoints,
  selectedLine,
  setSelectedLine,
  tripTime,
  setLineCode,
  setIsModalOpen,
}: CreateSchemeHandlersParams) {
  // 🟦 1) Change line code
  const handleLineCodeChange = (code: string) => {
    setLineCode(code);
    const line = mockLines[code as keyof typeof mockLines];
    setSelectedLine(line ?? null);
  };

  // 🟦 2) Add point
  const handleAddPoint = (point: any) => {
    if (!selectedLine) return;
    if (!tripTime) return;

    const lastPoint =
      routePoints.length > 0 ? routePoints[routePoints.length - 1] : null;

    const previousLocation = lastPoint?.location ?? selectedLine.initialPoint;
    if (!previousLocation) return;

    const distanceKm = calculateDistance(
      previousLocation.lat,
      previousLocation.lng,
      point.lat,
      point.lng
    );

    const avgSpeed = point.avgSpeed || 80;
    const driveTimeMin = Math.round((distanceKm / avgSpeed) * 60);

    let arrivalTime = "";
    if (lastPoint) {
      arrivalTime = addMinutesToTime(lastPoint.departureTime, driveTimeMin);
    } else {
      arrivalTime = addMinutesToTime(tripTime, driveTimeMin);
    }

    const stopTimeMin = point.localTime ?? 0;
    const departureTime = addMinutesToTime(arrivalTime, stopTimeMin);

    const cumulativeDistanceKm =
      (lastPoint?.cumulativeDistanceKm ?? 0) + distanceKm;

    const newPoint: RoutePoint = {
      id: `point-${Date.now()}`,
      order: routePoints.length + 1,
      type: point.pointType, // "PP", "PA", "PD", etc.

      distanceKm,
      cumulativeDistanceKm,
      driveTimeMin,
      stopTimeMin,

      arrivalTime,
      departureTime,

      location: {
        id: point.locationId ?? `loc-${Date.now()}`,
        name:
          point.name ??
          point.description ??
          `${point.city ?? ""}${point.state ? " / " + point.state : ""}`,
        city: point.city,
        state: point.state,
        shortName: point.sigla ?? "",
        kind: point.pointType,
        lat: point.lat,
        lng: point.lng,
      },

      avgSpeed,
      justification: point.justification || "",
    };

    setRoutePoints([...routePoints, newPoint]);
    setIsModalOpen(false);
  };

  // 🟦 3) Update point
  const handleUpdatePoint = (id: string, updates: Partial<RoutePoint>) => {
    setRoutePoints((prevPoints) => {
      const pointIndex = prevPoints.findIndex((p) => p.id === id);
      if (pointIndex === -1) return prevPoints;

      const newPoints = [...prevPoints];
      const updatedPoint: RoutePoint = {
        ...newPoints[pointIndex],
        ...updates,
      };

      // se mudou o tempo de parada, recalcula saída
      if (updates.stopTimeMin !== undefined) {
        updatedPoint.departureTime = addMinutesToTime(
          updatedPoint.arrivalTime,
          updatedPoint.stopTimeMin
        );
      }

      newPoints[pointIndex] = updatedPoint;

      // recalcula os seguintes
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

  // 🟦 4) Delete point
  const handleDeletePoint = (id: string) => {
    setRoutePoints((prevPoints) => {
      const pointIndex = prevPoints.findIndex((p) => p.id === id);
      if (pointIndex === -1) return prevPoints;

      const newPoints = prevPoints.filter((p) => p.id !== id);

      for (let i = 0; i < newPoints.length; i++) {
        const prevPoint = i > 0 ? newPoints[i - 1] : null;
        const prevLocation = prevPoint?.location ?? selectedLine?.initialPoint;
        const current = { ...newPoints[i] };

        if (!prevLocation || !current.location) continue;

        const distanceKm = calculateDistance(
          prevLocation.lat,
          prevLocation.lng,
          current.location.lat,
          current.location.lng
        );

        const prevCumulative = prevPoint?.cumulativeDistanceKm ?? 0;
        const cumulativeDistanceKm = prevCumulative + distanceKm;

        const avgSpeed = current.avgSpeed ?? 80;
        const driveTimeMin = Math.round((distanceKm / avgSpeed) * 60);

        let arrivalTime = "";
        if (prevPoint) {
          arrivalTime = addMinutesToTime(prevPoint.departureTime, driveTimeMin);
        } else if (tripTime) {
          arrivalTime = addMinutesToTime(tripTime, driveTimeMin);
        }

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
  };
}

// ----------------------------------------------------
// utils locais (saíram do CreateSchemePage)
// ----------------------------------------------------
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function addMinutesToTime(time: string, minutes: number): string {
  if (!time) return "";
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(
    2,
    "0"
  )}`;
}
