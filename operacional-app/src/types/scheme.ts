export interface RoutePoint {
  id: string;
  order: number;
  type: "PE" | "PP" | string;
  distanceKm: number;
  cumulativeDistanceKm: number;
  driveTimeMin: number;
  stopTimeMin: number;
  arrivalTime: string; // "HH:MM" (horário)
  departureTime: string; // "HH:MM"
  location: {
    id: string;
    name: string;
    city: string;
    state: string;
    shortName: string;
    kind: string;
    lat: number;
    lng: number;
  } | null;
}

export interface InitialPoint {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export interface OperationalScheme {
  id: string;

  lineCode: string;
  lineName: string;
  direction: "Ida" | "Volta";

  origin: string;
  originState: string;
  destination: string;
  destinationState: string;

  tripTime: string;

  initialPoint?: InitialPoint;
  routePoints: RoutePoint[];

  // 👉 campos que o card e o detalhe podem usar
  totalKm?: number;
  totalStops?: number;
  totalExpectedStops?: number;

  totalTravelMinutes?: number;
  totalStopMinutes?: number;
  totalDurationMinutes?: number;
  averageSpeedKmH?: number;

  travelTime?: string;
  totalStopTime?: string;

  rulesStatus?: {
    status: string;
    message: string;
  };

  createdAt?: string;
  updatedAt?: string;
}
