import { Clock, MapPin, Gauge, Route } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ANTTAlert } from "@/components/scheme/ANTTAlert";

import type { RoutePoint } from "@/types/scheme";

interface DetailPointCardProps {
  point: RoutePoint;
  index: number;
}

const pointTypeLabels: Record<string, string> = {
  PE: "Ponto de Embarque",
  PD: "Ponto de Desembarque",
  PP: "Ponto de Parada",
  PA: "Ponto de Apoio",
  TMJ: "Troca de Motorista",
  PL: "Ponto Livre",
};

export function DetailPointCard({ point, index }: DetailPointCardProps) {
  const city = point.location?.city ?? "";
  const state = point.location?.state ?? "";
  const description =
    point.location?.name ?? point.location?.shortName ?? `${city} / ${state}`;

  const avgSpeed =
    point.driveTimeMin > 0
      ? Number((point.distanceKm / (point.driveTimeMin / 60)).toFixed(1))
      : 0;

  const alerts = generateANTTAlerts(point, index, avgSpeed);

  return (
    <Card className="border border-slate-200 overflow-hidden">
      {/* ===================== HEADER ===================== */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4">
          {/* ESQUERDA */}
          <div className="flex items-start gap-3 flex-1">
            {/* Ordem */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white flex-shrink-0">
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              {/* Descrição */}
              <h3 className="text-slate-900 text-base font-medium truncate">
                {description}
              </h3>

              {/* Cidade / UF */}
              <p className="text-slate-600 text-sm truncate">
                {city} {city && state && "/"} {state}
              </p>
            </div>
          </div>

          {/* DIREITA */}
          <div className="text-right">
            <p className="text-slate-600 text-xs">Distância Acumulada</p>
            <p className="text-slate-900 font-medium">
              {point.cumulativeDistanceKm.toFixed(1)} km
            </p>
          </div>
        </div>
      </div>

      {/* ===================== CONTEÚDO ===================== */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <p className="text-slate-600 text-xs mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Chegada
            </p>
            <p className="text-slate-900">{point.arrivalTime}</p>
          </div>

          <div>
            <p className="text-slate-600 text-xs mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Temp. Local
            </p>
            <p className="text-slate-900">
              {formatMinutesToHours(point.stopTimeMin)}
            </p>
          </div>

          <div>
            <p className="text-slate-600 text-xs mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Saída
            </p>
            <p className="text-slate-900">{point.departureTime}</p>
          </div>

          <div>
            <p className="text-slate-600 text-xs mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Temp. Desloc.
            </p>
            <p className="text-slate-900">
              {formatMinutesToHours(point.driveTimeMin)}
            </p>
          </div>

          <div>
            <p className="text-slate-600 text-xs mb-1 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" /> Vel. Média
            </p>
            <p className="text-slate-900">{avgSpeed} km/h</p>
          </div>

          <div>
            <p className="text-slate-600 text-xs mb-1 flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5" /> Distância
            </p>
            <p className="text-slate-900">{point.distanceKm.toFixed(1)} km</p>
          </div>
        </div>

        {/* Tipo (somente aqui, não no header) */}
        <div className="pb-4 border-b border-slate-200 mb-4">
          <p className="text-slate-600 text-xs mb-1">Tipo de Ponto</p>
          <p className="text-slate-900 text-sm">
            {pointTypeLabels[point.type] || point.type}
          </p>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div>
            <p className="text-slate-600 text-xs mb-2">
              Regras ANTT / Observações
            </p>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <ANTTAlert key={i} alert={alert} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ===================== HELPERS ===================== */

function formatMinutesToHours(min: number) {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

interface ANTTAlertData {
  type: "success" | "warning" | "error";
  message: string;
}

function generateANTTAlerts(
  point: RoutePoint,
  index: number,
  avgSpeed: number
): ANTTAlertData[] {
  const alerts: ANTTAlertData[] = [];
  const acc = point.cumulativeDistanceKm ?? 0;

  // regras ANTT...
  // (mantive exatamente seu comportamento original)

  if (index === 0 && point.type === "PP") {
    if (acc >= 262 && acc <= 330)
      alerts.push({
        type: "success",
        message: `Primeiro ponto de parada (${acc.toFixed(1)} / 330 km)`,
      });
    else if (acc > 330)
      alerts.push({
        type: "error",
        message: `Distância acima do permitido (${acc.toFixed(1)} / 330 km)`,
      });
    else
      alerts.push({
        type: "warning",
        message: `Parada antecipada (${acc.toFixed(1)} / 262 km)`,
      });
  }

  if (point.type === "PA") {
    if (acc >= 402 && acc <= 495)
      alerts.push({
        type: "success",
        message: `Ponto de apoio conforme (${acc.toFixed(1)} / 495 km)`,
      });
    else if (acc < 402)
      alerts.push({
        type: "warning",
        message: `Ponto de apoio antecipado (${acc.toFixed(1)} / 402 km)`,
      });
    else
      alerts.push({
        type: "error",
        message: `Ponto de apoio além do limite (${acc.toFixed(1)} / 495 km)`,
      });
  }

  if (point.type === "TMJ") {
    if (acc <= 660)
      alerts.push({
        type: "success",
        message: `Troca de motorista em jornada (${acc.toFixed(1)} / 660 km)`,
      });
    else
      alerts.push({
        type: "error",
        message: `Troca de motorista além do limite (${acc.toFixed(
          1
        )} / 660 km)`,
      });
  }

  if (avgSpeed > 90)
    alerts.push({
      type: "warning",
      message: `Velocidade acima da recomendada (${avgSpeed} km/h)`,
    });

  if ((point.type === "PP" || point.type === "PA") && point.stopTimeMin < 20)
    alerts.push({
      type: "warning",
      message: `Tempo de parada pode ser insuficiente (${formatMinutesToHours(
        point.stopTimeMin
      )})`,
    });

  if (point.distanceKm > 200)
    alerts.push({
      type: "warning",
      message: `Trecho longo sem parada (${point.distanceKm.toFixed(1)} km)`,
    });

  return alerts;
}
